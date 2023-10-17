# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### [1.1.0]

#### Added

-   Sync Cards Button
    -   Syncs all cards on the lucidspark board by fetching the matching codebeamer items and updating the card content

#### Changed

-   Import All button
    -   count displays the number of items which have not been imported yet from that specific Tracker
    -   imports only those missing items to avoid duplicates
-   Item Import
    -   cards are spread out more evenly on the board
-   UI Changes
    -   added padding to the top of the import modal

## Released

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
