## Introduction
`horari` at it's core ([`@horari/core`](./core)) is a dependency poor Node.js library for creating events on generic "resources" which can be organized in schedules. A resource can only have one active event at a time in a schedule and thereby `horari` can be used as an absolute basic building block in booking/scheduling applications of any kind.

Different storage systems can be used to store events managed by `horari` by providing a `DataManager` to it.<br>
The only official `DataManager` currently available is [`@horari/mongo-driver`](./storage-drivers/mongo-driver) which lets `horari` store the events in a `MongoDB` database.

## Project status
`horari` is currently in early development with potential API changes at any time and is currently very bad documented.

## Usage
To be done.

## Roadmap
To be done.