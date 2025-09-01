from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
import json
from pathlib import Path
from sqlalchemy.orm import Session
from brewing.models import Feature as FeatureModel, create_database_engine


# Data Models
class ProjectConfig(BaseModel):
    id: str = Field(..., description="Project ID (UUID v4)")
    onboarded: bool = Field(..., description="Whether the project has been onboarded")
    name: str = Field(..., description="Project name")


class FeatureBase(BaseModel):
    name: str = Field(..., description="The name of the feature")
    summary: Optional[str] = Field(None, description="Short description of the feature")
    content: Optional[str] = Field(
        None, description="The published specification content"
    )
    draft_content: Optional[str] = Field(
        None, description="The unpublished specification content"
    )


class FeatureCreate(BaseModel):
    name: str = Field(..., description="The name of the feature")


class FeatureUpdate(BaseModel):
    name: Optional[str] = Field(None, description="The name of the feature")
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
    response_model=ProjectConfig,
    summary="Get project configuration from `project.json`",
)
async def get_project():
    """Get the current project configuration from .brewing/project.json"""
    return get_project_config()


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


@app.get("/features", response_model=List[Feature], summary="List all features")
async def list_features(db: Session = Depends(get_db)):
    """Get all features without pagination"""
    features = db.query(FeatureModel).all()
    return [Feature(**feature.to_dict()) for feature in features]


@app.post(
    "/features", response_model=Feature, status_code=201, summary="Create a feature"
)
async def create_feature(feature: FeatureCreate, db: Session = Depends(get_db)):
    """Create a new feature with only a name"""
    now = datetime.utcnow()

    db_feature = FeatureModel(
        id=generate_uuid(),
        name=feature.name,
        summary=None,
        content=None,
        draft_content=None,
        date_published=None,
        date_created=now,
        date_updated=now,
    )

    db.add(db_feature)
    db.commit()
    db.refresh(db_feature)

    return Feature(**db_feature.to_dict())


@app.get("/features/{feature_id}", response_model=Feature, summary="Get a feature")
async def get_feature(feature_id: str, db: Session = Depends(get_db)):
    """Get a single feature by ID"""
    feature = db.query(FeatureModel).filter(FeatureModel.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return Feature(**feature.to_dict())


@app.put("/features/{feature_id}", response_model=Feature, summary="Update a feature")
async def update_feature(
    feature_id: str, feature_update: FeatureUpdate, db: Session = Depends(get_db)
):
    """Update a feature by ID. All feature fields are provided."""
    feature = db.query(FeatureModel).filter(FeatureModel.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    # Update fields if provided
    if feature_update.name is not None:
        feature.name = feature_update.name
    if feature_update.summary is not None:
        feature.summary = feature_update.summary
    if feature_update.content is not None:
        feature.content = feature_update.content
    if feature_update.draft_content is not None:
        feature.draft_content = feature_update.draft_content

    # Update the timestamp
    feature.date_updated = datetime.utcnow()

    db.commit()
    db.refresh(feature)

    return Feature(**feature.to_dict())


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

    uvicorn.run(app, host="0.0.0.0", port=9608)
