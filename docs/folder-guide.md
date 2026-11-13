# Where things belong

## Website content

```text
_projects/
  robotics/                  ARIAC, rover, Perception Challenge, Path Planning
  product-design/            Wheelchair, electric bike, and go-kart
  connected-systems/         Earth Fokus IoT food-waste work page
  experience/
    goodyear/                Current physics/ML models and 2024 internship work
    mrf/                     Product engineering, lifecycle, and manufacturing
    terrapin-works/          Additive manufacturing and lab operations
    ford/                    Manufacturing plant digitization
    aiesec/                  Cross-cultural volunteering
_data/employers.yml          All experience roles, dates, summaries, and project links
_drafts/                    Markdown thought drafts for local preview
blog/index.html             Thoughts & Notes listing
```

Every project has `permalink: /projects/<slug>/` in its front matter. Keep that value when moving or renaming a source file so existing links continue to work. Add entries for Thoughts & Notes under `_posts/YYYY-MM-DD-title.md` when you're ready to share them. They can be questions or ideas in progress; they don't need to be settled opinions.

## Website assets

```text
assets/
  profile/                  Headshots and soldering banner
  education/                University logos
  projects/
    ariac/                  Video cover
    rover-arm/              Rendered rover image
    convertible-wheelchair/ Prototype photo and both CAD configurations
    electric-bike/          Bike and awards photo
    formula-karting/         Competition kart photo
    iot-food-waste/          Earth Fokus smart trashcan, tablet UI, lighting sample
    perception-challenge/   YouTube demo cover for the TurtleBot project
    path-planning/          YouTube demo cover for the path-planning project
  img/favicon.svg           Site icon
  css/                      Site stylesheet
  js/                       Project filtering
```

Keep a project's images, videos, GIFs, and reports together under its asset folder. Add subfolders such as `images/` or `reports/` only when the collection grows. For future workplace media, use `assets/experience/goodyear/<project-slug>/` or `assets/experience/mrf/<project-slug>/`. These folders can be created when the first assets are added.

Use readable filenames without spaces, and update the project's `media`, `gallery`, or `document` fields to match. Folder names in URLs use forward slashes.

## Local reference material

```text
reference-materials/
  profile/                  Original profile photos and reference resume
  projects/                 Original project-image uploads, grouped by project
  writing/                  Original blog text drafts
```

This entire folder is ignored by Git and excluded from the website build. Files were moved without changing their contents. Keep a separate backup if you want these local-only originals preserved elsewhere. The kart's original file is used directly as its website asset.

The smart-trashcan uploads were also moved directly into `assets/projects/iot-food-waste/` as `prototype.jpg`, `tablet-interface.jpg`, and `demo.mp4`. Despite its filename, the video is a lighting sample only. The page notes that further operational details cannot be shared due to an NDA, credits Earth Fokus, and states that all rights to the prototype belong to Earth Fokus.

## Generated files and tooling

`_site/` is generated website output, `.preview/` holds local verification files and the ARIAC reference recording, `vendor/` contains Ruby dependencies, and `.bundle/` contains local Bundler settings. These are ignored by Git. Edit authored content and assets rather than generated copies.

Drafts in `_drafts/` are also ignored by Git. Preview them locally with `preview.ps1`; move a finished post to `_posts/YYYY-MM-DD-title.md` to include it in the public repository. Keep personal documents and source uploads in `reference-materials/`. Before committing, review `git status --short` and `git diff --cached --name-only` for unintended files. Git ignore rules do not remove files from existing commits.
