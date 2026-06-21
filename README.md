# Study Cards

A mobile-friendly flashcard application that runs entirely on GitHub Pages.

## Features

- Mobile responsive
- No login required
- Read-only flashcards
- Study sets stored as JSON files
- Tap card to flip
- Previous/Next navigation
- Deployable to GitHub Pages

## Adding New Study Sets

Create a new file:

data/my-set.json

Example:

```json
{
  "id": "my-set",
  "title": "My Study Set",
  "cards": [
    {
      "front": "Question",
      "back": "Answer"
    }
  ]
}
```

Then add the set to:

data/index.json

## Deploying to GitHub Pages

1. Create a GitHub repository.

2. Push the project.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin REPOSITORY_URL
git push -u origin main
```

3. In GitHub:

Settings → Pages

4. Under Source:

GitHub Actions

5. Push any commit.

The workflow automatically deploys the app.

Your site will be available at:

https://USERNAME.github.io/REPOSITORY_NAME/