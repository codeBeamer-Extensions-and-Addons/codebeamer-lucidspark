# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### [1.2.0]

#### Added

-   Relation & Association Visualization Button
    -   Creates lines between cards based on the relations and associations of the codebeamer items
    -   Applies to the codebeamer items in the current tracker to give the user more control over the visualization
    -   The button displays the number of relations and associations that haven't been visualized yet.
    -   If all relations and associations have been visualized, the button is labeled with "Hide ..." and removes all visualized relations and associations in the current tracker from the board

#### Changed

-   Fixed the issue where the Assisted query input was not used as the default query input

## Released

### [1.1.0]

#### Added

-   Sync Cards Button
    -   Syncs all cards on the lucidspark board by fetching the matching codebeamer items and updating the card content

#### Changed

-   Import All button
    -   count displays the number of items which have not been imported yet from that specific Tracker
    -   imports only those missing items to avoid duplicates
-   Item Import
    -   cards are spread out further depending on the number of items imported
-   UI Changes
    -   added padding to the top of the import modal
    -   Query Results
        -   Background of the query result turns #f5f5f5 (light grey) when hovered
        -   The whole query result is clickable now
        -   The cursor becomes a pointer when hovering over the query result
    -   CBQL Toggle button has been moved to the right side of the query input

### [1.0.0]

First version of the codebeamer-lucidspark plugin / MVP

#### Added

-   Import Modal
-   Connection to a Codebeamer instance
-   Project Selection
-   Tracker Selection
-   Assisted Item Query
-   CBQL Input Item Query
-   Settings Modal
    -   Project Selection
    -   Connection to a Codebeamer instance
-   Announcements page
-   Item Importing to the lucidspark board
-   Miro codebeamer-cards importer
