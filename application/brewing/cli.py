"""Main CLI interface for the brewing tool"""

import click
from pathlib import Path
import json
import signal
import sys
import webbrowser
import uuid


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """Brew - AI-powered software development CLI tool"""
    pass


def create_project(project_name: str, project_dir: Path = None) -> dict:
    """Create a new Brew project with the given name

    Args:
        project_name: Name of the project
        project_dir: Directory to create the project in (defaults to current working directory)

    Returns:
        dict: Project configuration that was created

    Raises:
        FileExistsError: If the project directory already exists
    """
    if project_dir is None:
        project_dir = Path.cwd()

    # Create the full project path
    project_path = project_dir / project_name

    # Check if project directory already exists
    if project_path.exists():
        raise FileExistsError(f"Sorry the '{project_name}' directory already exists.")

    # Create project directory
    project_path.mkdir()

    # Create .brewing directory within the project
    brewing_dir = project_path / ".brewing"
    brewing_dir.mkdir()

    # Create ProjectConfig with UUID v4, onboarded as false, and project name
    project_config = {"id": str(uuid.uuid4()), "onboarded": False, "name": project_name}

    with open(brewing_dir / "project.json", "w") as f:
        json.dump(project_config, f, indent=2)

    # Create SQLite database and migrate schema
    from brewing.models import init_database

    init_database(str(brewing_dir))

    return project_config


@cli.command()
@click.argument("project_name")
def create(project_name):
    """Create a new Brew project in the specified directory"""
    try:
        create_project(project_name)

        click.echo("✅ Cool! Your project was created.")
        click.echo("")
        click.echo("Start developing using:")
        click.echo(f"cd {project_name}")
        click.echo("brewing start")

    except FileExistsError as e:
        click.echo(f"❌ {e}")
    except Exception as e:
        click.echo(f"❌ Error creating project: {e}")


@cli.command()
def start():
    """Start the brewing REST API and open the user interface"""
    cwd = Path.cwd()
    brewing_dir = cwd / ".brewing"

    # Check if project is initialized
    if not brewing_dir.exists():
        click.echo(
            "❌ This directory is not a Brew project! Run `brewing create <project_name>` first."
        )
        return

    click.echo("🚀 Starting Brew development environment...")
    click.echo("✅ REST API server started on http://localhost:9680")
    click.echo("Press Cmd+C to stop the project")
    click.echo("")
    click.echo("🌐 Launching Brew user interface: http://localhost:5173. One moment...")

    # Start the API server
    try:
        start_api_environment()
    except KeyboardInterrupt:
        click.echo("\n👋 Brew API server stopped")
    except Exception as e:
        click.echo(f"❌ Error starting API server: {e}")


def start_api_environment():
    """Start the FastAPI REST API and open the user interface"""
    import uvicorn
    import time
    import threading

    # Global variables to track server
    server = None
    shutdown_event = threading.Event()

    def signal_handler(signum, frame):
        """Handle shutdown signals gracefully"""
        click.echo("\n🛑 Shutting down API server...")
        shutdown_event.set()
        if server:
            server.should_exit = True
        sys.exit(0)

    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start FastAPI server in a separate thread
    def start_api_server():
        """Start the FastAPI server directly in this process"""
        try:
            nonlocal server
            # Import the app from the brewing package
            from brewing.api import app

            # Create uvicorn server config
            config = uvicorn.Config(
                app=app, host="0.0.0.0", port=9680, log_level="info", access_log=True
            )

            # Create and start server
            server = uvicorn.Server(config)
            click.echo("✅ REST API server started on http://localhost:9680")

            # Start the server (this will run until interrupted)
            server.run()

        except Exception as e:
            click.echo(f"❌ Error starting API server: {e}")

    # Start API server in a separate thread
    api_thread = threading.Thread(target=start_api_server, daemon=True)
    api_thread.start()

    # Wait a moment for the server to start, then open browser
    def open_browser():
        time.sleep(3)  # Wait for API server to start
        if not shutdown_event.is_set():
            # Open the user interface (expected to be running on port 5173)
            webbrowser.open("http://localhost:5173")

    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()

    # Wait for shutdown signal
    try:
        while not shutdown_event.is_set():
            time.sleep(1)
    except KeyboardInterrupt:
        # Handle keyboard interrupt gracefully
        signal_handler(signal.SIGINT, None)


if __name__ == "__main__":
    cli()
