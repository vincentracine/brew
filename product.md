# Brew

## Introduction

Brew is a project focused on leveraging AI agents to build software products based on specifications. The approach emphasizes opinionated, structured development processes guided by AI assistance.

Note: Brew has no association with `brew` the package manager for MacOS.

## Global constraints

| Key | Value      | Description                             |
| --- | ---------- | --------------------------------------- |
| ORM | sqlalchemy | The framework to use for Python SQL ORM |

## Features

### Brew CLI Tool

The Brew CLI tool `brewing` enables developers to create and manage their brew projects.
Typically developer tool UIs are installed as applications e.g. VSCode or Docker, except I want the Brew installation to be a CLI tool like `npm`. The CLI tool serves the Brew
user experience as a web application hosted on the local port 9608. The web application has access to the project directory and the files contained within it. The web application is used to
converse with Brew to generate a product specification and then have Brew generate working code that can be deployed to production based on the product specification.

#### User stories

1. As a developer, I want to create a new project using `brewing create`, so that I can iterate on my product specification.
2. As a developer, I want to launch my project using `brewing start`, so that I can use the user interface to iterate on my product.

#### Command: brewing create

Create a new Brew project in the specified directory. If the directory already exists, an error is thrown saying "Sorry the '$project_dir_name' directory already exists.".
If the directory does not exist, it is created by the CLI tool containing a `.brewing` directory.
Within the `.brewing` directory, the CLI tool will create a `project.json` file containing a JSON object for the ProjectConfig.
The project config object is populated with a UUID v4 and onboarded as false.

Creating a project will also create a SQLite database in `.brewing` and migrate the schema. The only model not stored in the database is
`ProjectConfig`, this object is persisted in the `project.json` file.

```
ProjectConfig:
* id: UUID v4
* onboarded: true/false
* name: text
```

Example:

```bash
brewing create my-project
✅  Cool! Your project was created.

Start developing using:
cd my-project
brewing start
```

#### Command: brewing start

Start the project user interface by opening the browser to the URL http://localhost:5173.

The start command launches the brewing REST API on port 9608, see Brew CLI REST API section. The REST API allows the Brew UI to interact with the CLI.
When the user interrupts the command, using cmd+c on MacOS or ctrl+c otherwise, the API is shutdown.

Example:

```bash
brewing start
🚀 Starting Brew development environment...
✅ REST API server started on http://localhost:9608
Press Cmd+C to stop the project

🌐 Launching Brew user interface: http://localhost:5173. One moment...
```

### Brew CLI REST API

The Brew CLI REST API runs on http://localhost:9608.

| Method | Endpoint         | Purpose                                                    | Response              |
| ------ | ---------------- | ---------------------------------------------------------- | --------------------- |
| GET    | `/health`        | Health check                                               | Status object         |
| GET    | `/project`       | Get project configuration from `project.json`              | ProjectConfig         |
| PUT    | `/project`       | Update project configuration and save it to `project.json` | Updated ProjectConfig |
| GET    | `/features`      | List all features                                          | Array of features     |
| POST   | `/features`      | Create a feature                                           | Created feature       |
| GET    | `/features/{id}` | Get a feature                                              | Feature object        |
| PUT    | `/features/{id}` | Update a feature                                           | Updated feature       |
| DELETE | `/features/{id}` | Delete a feature                                           | 204 No Content        |

#### Models

Feature: A product feature. Each feature contains a specification describing the feature requirements.

| Field          | Type      | Description                             |
| -------------- | --------- | --------------------------------------- |
| id             | UUID v4   | Directory containing the frontend code  |
| name           | text      | The name of the feature                 |
| summary        | text      | short description of the feature        |
| content        | text      | the published specification content     |
| draft_content  | text      | the unpublished specification content   |
| date_published | timestamp | The date the feature was last published |
| date_updated   | timestamp | The date the feature was last updated   |
| date_created   | timestamp | The date the feature was created        |

### Frontend User Interface

#### Constraints

| Key        | Value                                | Description                            |
| ---------- | ------------------------------------ | -------------------------------------- |
| Directory  | `./application/www`                  | Directory containing the frontend code |
| Frameworks | React, Typescript, Vite, Tailwind V4 | The frameworks to use                  |

#### User stories

1. As a developer, I want to onboard, so that I can setup my new project

Onboarding shows a welcome screen with a "Get started" button. When the user clicks the Get started button they
are shown a onboarding form capturing the project name. The welcome screen is located at the root url `/`. The component
checks the `ProjectConfig.onboarded` value. If true, the user is redirected to `/editor`. If the value is false, they are
shown the welcome screen. To get the the `ProjectConfig`, the welcome screen makes a request to `GET /project`.

When the user submits the onboarding form, `ProjectConfig.onboarded` is set to `true` and saved using the `PUT /project`
endpoint.

2. As a developer, I want to type in a feature draft content editor, so that I can modify the specification

This story enables the developer to modify their feature draft specification content by typing text in a TipTap editor.
After a debounce of 1 second, the content of the editor is persisted in `Feature.draft_content` using the API.

3. As a developer, I want the sidebar to remain fixed and not scroll as the page content scrolls, so that I can always see it.
4. As a developer, I want to create a new feature by clicking the "New feature" button in the sidebar, so that I can define a feature.

This user story enables a developer to create a new feature. When the user clicks the button, a new feature is immediately created
with the name "Untitled feature". It shows up in the sidebar immediately and is persisted using the API.

5. As a developer, I want to navigate to a feature by clicking it in the sidebar, so that I can modify it.

This story enables a user to click on a feature in the sidebar and be navigated to the `features/:feature_id` page.
The `FeaturePage` shows the TipTap editor where the user can type and modify the feature draft content.

6. As a developer, I want the sidebar to show the features from the API, so that I can can on one.

The sidebar displays the features, without pagination. A "New feature" button is the first clickable item in the "FEATURES"
section. Sidebar items should not be full width but instead hug their contents. When the URL matches the sidebar item, the
sidebar item should have the class "bg-active".

7. As a developer, I want to double click the feature name on the feature page, so that I can modify the name.

This story enables the developer to double click on the feature name at the top of the feature page to make it editble.
This allows the user to then type a new name. When the input focus blurs, the `Feature.name` shall be persisted using the API.

Styling:

- Hovering over the feature name applies the `bg-active` background color.
- The text should have `rounding-xl`
- The text width should hug the content.
- The input should have the same font size as the text, make this explicit.
- The input should have the `bg-active` background color and no border.
