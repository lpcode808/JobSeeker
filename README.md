# JobSeeker Artifact

A static web mockup for a CLI-inspired job seeker artifact. It stores a file tree and conversation log in browser storage, then exports the artifact as JSON, markdown, or a zip bundle.

## Features
- File tree with editable markdown files
- Conversational intake view with stubbed responses
- Onboarding overlay and sample data
- Local storage persistence
- Export to JSON, markdown bundle, or ZIP

## Usage
Open `index.html` in a browser. No build step required.

## Storage
All data is saved in `localStorage` under the key `jobseeker.artifact.v1`.

## Structure
- `index.html`: UI shell
- `styles.css`: Visual styling
- `app.js`: State, rendering, storage, exports
