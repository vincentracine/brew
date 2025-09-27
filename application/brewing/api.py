from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
import json
import subprocess
import os
from pathlib import Path
from sqlalchemy.orm import Session
from brewing.models import Feature as FeatureModel, create_database_engine
import openai


# Data Models
class ProjectConfig(BaseModel):
    id: str = Field(..., description="Project ID (UUID v4)")
    onboarded: bool = Field(..., description="Whether the project has been onboarded")
    name: str = Field(..., description="Project name")


class ProjectConfigResponse(BaseModel):
    data: ProjectConfig


class FeatureBase(BaseModel):
    name: str = Field(..., description="The name of the feature")
    emoji: Optional[str] = Field(None, description="The emoji of the feature")
    summary: Optional[str] = Field(None, description="Short description of the feature")
    content: Optional[str] = Field(
        None, description="The published specification content"
    )
    draft_content: Optional[str] = Field(
        None, description="The unpublished specification content"
    )


class FeatureCreate(BaseModel):
    name: str = Field(..., description="The name of the feature")
    emoji: Optional[str] = Field(None, description="The emoji of the feature")


class FeatureUpdate(BaseModel):
    name: Optional[str] = Field(None, description="The name of the feature")
    emoji: Optional[str] = Field(None, description="The emoji of the feature")
    summary: Optional[str] = Field(None, description="Short description of the feature")
    content: Optional[str] = Field(
        None, description="The published specification content"
    )
    draft_content: Optional[str] = Field(
        None, description="The unpublished specification content"
    )


class Feature(FeatureBase):
    id: str = Field(..., description="Feature ID (UUID v4)")
    date_published: Optional[str] = Field(
        None, description="The date the feature was last published"
    )
    date_created: str = Field(..., description="The date the feature was created")
    date_updated: str = Field(..., description="The date the feature was last updated")


class ProjectUpdate(BaseModel):
    onboarded: bool = Field(..., description="Whether the project has been onboarded")
    name: Optional[str] = Field(None, description="Project name")


class ListFeaturesResponse(BaseModel):
    data: List[Feature]


class GetFeatureResponse(BaseModel):
    data: Feature


class CreateFeatureResponse(BaseModel):
    data: Feature


class UpdateFeatureResponse(BaseModel):
    data: Feature


# Database session dependency
def get_db():
    """Get database session"""
    brewing_dir = Path.cwd() / ".brewing"
    if not brewing_dir.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    _, SessionLocal = create_database_engine(str(brewing_dir))
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# FastAPI app
app = FastAPI(
    title="Brew CLI REST API",
    description="REST API for the Brew CLI tool",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Helper functions
def generate_uuid() -> str:
    """Generate a new UUID string"""
    return str(uuid.uuid4())


def get_project_root() -> Path:
    """Get the project root directory (contains .brewing folder)"""
    return Path.cwd()


def write_product_md(content: str) -> None:
    """Write feature content to product.md in project root"""
    project_root = get_project_root()
    product_md_path = project_root / "product.md"

    with open(product_md_path, "w", encoding="utf-8") as f:
        f.write(content)


def generate_llm_summary(old_content: str, new_content: str) -> str:
    """Generate a summary of feature changes using LLM"""
    try:
        # Initialize OpenAI client
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        print("Generating a summary of feature changes using LLM")

        prompt = f"""
        Analyze the changes between these two feature specifications and create a concise summary of what was modified.
        
        OLD CONTENT:
        {old_content}
        
        NEW CONTENT:
        {new_content}
        
        Provide a brief summary of the key changes made to the feature specification.
        Focus on what functionality was added, removed, or modified.
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI assistant that analyzes software product specification changes and creates concise summaries.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=5000,
            temperature=0.3,
        )
        summary = response.choices[0].message.content.strip()
        print(f"LLM summary: {summary}")
        return summary

    except Exception as e:
        print(f"Error generating LLM summary: {e}")
        return "Feature specification was updated"


def run_cursor_agent(changes_summary: str) -> None:
    """Run cursor-agent CLI tool to modify codebase"""
    try:
        project_root = get_project_root()

        prompt = f"""
        Modify the codebase to reflect the product specification in `product.md`. Identify the differences between the product specification and the existing code before making changes.

        Changes:
        {changes_summary}
        """

        # Run cursor-agent command
        result = subprocess.run(
            ["cursor-agent", "-p", prompt],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
        )

        if result.returncode != 0:
            print(f"cursor-agent error: {result.stderr}")
        else:
            print(f"cursor-agent output: {result.stdout}")

    except subprocess.TimeoutExpired:
        print("cursor-agent command timed out")
    except FileNotFoundError:
        print("cursor-agent command not found. Please install cursor-agent CLI tool.")
    except Exception as e:
        print(f"Error running cursor-agent: {e}")


def get_project_config_path() -> Path:
    """Get the path to the project configuration file"""
    # Use the current working directory where the CLI was invoked
    return Path.cwd() / ".brewing" / "project.json"


def get_project_config() -> ProjectConfig:
    """Get the current project configuration"""
    config_path = get_project_config_path()

    if not config_path.exists():
        raise HTTPException(status_code=404, detail="Project configuration not found")

    try:
        with open(config_path, "r") as f:
            config_data = json.load(f)
            # Ensure the config has the required fields
            if (
                "id" not in config_data
                or "onboarded" not in config_data
                or "name" not in config_data
            ):
                # If config is incomplete, create a default one
                config_data = {
                    "id": config_data.get("id", generate_uuid()),
                    "onboarded": config_data.get("onboarded", False),
                    "name": config_data.get("name", "Untitled Project"),
                }
                save_project_config(config_data)
            return ProjectConfig(**config_data)
    except (json.JSONDecodeError, IOError) as e:
        raise HTTPException(
            status_code=500, detail=f"Error reading project configuration: {str(e)}"
        )


def save_project_config(config: dict) -> dict:
    """Save the project configuration to file"""
    config_path = get_project_config_path()

    # Ensure the .brewing directory exists
    config_path.parent.mkdir(exist_ok=True)

    try:
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
        return config
    except (IOError, OSError) as e:
        raise HTTPException(
            status_code=500, detail=f"Error saving project configuration: {str(e)}"
        )


# API Endpoints
@app.get(
    "/project",
    response_model=ProjectConfigResponse,
    summary="Get project configuration from `project.json`",
)
async def get_project():
    """Get the current project configuration from .brewing/project.json"""
    return ProjectConfigResponse(data=get_project_config())


@app.put(
    "/project",
    response_model=ProjectConfig,
    summary="Update project configuration and save it to `project.json`",
)
async def update_project(project_update: ProjectUpdate):
    """Update the project configuration and save to .brewing/project.json"""
    current_config = get_project_config()

    # Update the fields if provided
    updated_config = {
        "id": current_config.id,
        "onboarded": project_update.onboarded,
        "name": project_update.name
        if project_update.name is not None
        else current_config.name,
    }

    return save_project_config(updated_config)


@app.get("/features", response_model=ListFeaturesResponse, summary="List all features")
async def list_features(db: Session = Depends(get_db)):
    """Get all features without pagination"""
    features = db.query(FeatureModel).all()
    return ListFeaturesResponse(
        data=[Feature(**feature.to_dict()) for feature in features]
    )


@app.post(
    "/features",
    response_model=CreateFeatureResponse,
    status_code=201,
    summary="Create a feature",
)
async def create_feature(feature: FeatureCreate, db: Session = Depends(get_db)):
    """Create a new feature with only a name"""
    now = datetime.utcnow()

    db_feature = FeatureModel(
        id=generate_uuid(),
        name=feature.name,
        emoji=feature.emoji,
        summary=None,
        content="",
        draft_content="",
        date_published=None,
        date_created=now,
        date_updated=now,
    )

    db.add(db_feature)
    db.commit()
    db.refresh(db_feature)

    return CreateFeatureResponse(data=Feature(**db_feature.to_dict()))


@app.get(
    "/features/{feature_id}", response_model=GetFeatureResponse, summary="Get a feature"
)
async def get_feature(feature_id: str, db: Session = Depends(get_db)):
    """Get a single feature by ID"""
    feature = db.query(FeatureModel).filter(FeatureModel.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return GetFeatureResponse(data=Feature(**feature.to_dict()))


@app.put(
    "/features/{feature_id}",
    response_model=UpdateFeatureResponse,
    summary="Update a feature",
)
async def update_feature(
    feature_id: str, feature_update: FeatureUpdate, db: Session = Depends(get_db)
):
    """Update a feature by ID. All feature fields are provided."""
    feature = db.query(FeatureModel).filter(FeatureModel.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    # Store old content for comparison
    old_content = feature.content

    # Update fields if provided
    if feature_update.name is not None:
        feature.name = feature_update.name
    if feature_update.emoji is not None:
        feature.emoji = feature_update.emoji
    if feature_update.summary is not None:
        feature.summary = feature_update.summary
    if feature_update.content is not None:
        feature.content = feature_update.content
    if feature_update.draft_content is not None:
        feature.draft_content = feature_update.draft_content

    # Update the timestamp
    feature.date_updated = datetime.utcnow()

    # Check if content changed and trigger LLM integration
    if feature_update.content is not None and feature_update.content != old_content:
        try:
            # Write content to product.md
            write_product_md(feature_update.content)

            # Generate LLM summary of changes
            changes_summary = generate_llm_summary(
                old_content or "", feature_update.content
            )

            # Run cursor-agent to modify codebase
            print(
                f"Running cursor-agent to modify codebase with changes summary: {changes_summary}"
            )
            run_cursor_agent(changes_summary)

        except Exception as e:
            print(f"Error in LLM integration: {e}")
            # Continue with the update even if LLM integration fails

    db.commit()
    db.refresh(feature)

    return UpdateFeatureResponse(data=Feature(**feature.to_dict()))


@app.delete("/features/{feature_id}", status_code=204, summary="Delete a feature")
async def delete_feature(feature_id: str, db: Session = Depends(get_db)):
    """Delete a feature by ID"""
    feature = db.query(FeatureModel).filter(FeatureModel.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    db.delete(feature)
    db.commit()
    return None


# Health check endpoint
@app.get("/health", summary="Health check")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9680)
