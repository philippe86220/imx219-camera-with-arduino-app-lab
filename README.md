# IMX219 Camera with Arduino App Lab

## Project overview

This project demonstrates how to use a Sony IMX219 camera with an Arduino UNO Q, the Arduino® UNO™ Media Carrier, and Arduino App Lab.

The application provides a simple WebUI that allows the user to:

- adjust the camera exposure;
- adjust the analogue gain;
- capture a full-resolution image (3280 × 2464);
- process the RAW Bayer image;
- display the resulting JPEG image directly in the WebUI.

The project does not use the MCU. The complete application runs on the Linux/MPU side.

Although the application itself is relatively simple to use, several different components work together behind the scenes: the WebUI, the main Python application, an App Lab camera brick, a local HTTP service, Linux V4L2 tools, and the IMX219 camera connected through the Media Carrier.

One of the goals of this README is therefore not only to explain how to run the application, but also to describe this architecture in simple terms for users who are discovering Arduino App Lab.

## How the application works

Before looking at the source code, it is useful to understand the basic path followed by a command:

    Web browser
        │
        ▼
    WebUI (app.js)
        │
        ▼
    Main application (main.py)
        │
        ▼
    Camera interface (__init__.py)
        │
        ▼
    Camera service (camera_service.py)
        │
        ▼
    Linux camera interface (V4L2 / Media Controller)
        │
        ▼
    Media Carrier
        │
        ▼
    Sony IMX219 camera

Each part has a specific role.

The WebUI interacts with the user.  
`main.py` manages the application logic.  
`__init__.py` provides a simple Python interface to the camera service.  
`camera_service.py` controls the Linux camera pipeline and performs the image acquisition and processing.  
The Media Carrier provides the hardware interface used to connect the IMX219 camera to the board.

The following sections explain these different layers step by step.

## Hardware and software requirements

### Hardware

This project uses:

- an Arduino UNO Q;
- an Arduino® UNO™ Media Carrier;
- a Sony IMX219 camera module;
- the appropriate camera ribbon cable.

The IMX219 camera is connected to one of the MIPI-CSI camera connectors
of the Arduino® UNO™ Media Carrier.

#### Arduino® UNO™ Media Carrier

The Arduino® UNO™ Media Carrier provides the hardware interface used
to connect the IMX219 camera to the UNO Q.

![Arduino UNO Media Carrier](images/uno-media-carrier.png)

#### Camera used for this project

The camera used during development is a Sony IMX219-based camera module
supplied with its camera ribbon cable.

[Camera used for this project (Amazon France)](https://www.amazon.fr/dp/B0CPM292WP)

![Sony IMX219 camera module and ribbon cable](images/mx219-camera.png)

### Software

The application is developed and executed with Arduino App Lab.

No manual installation of the camera processing dependencies is required
on the Linux system. The additional packages needed by the camera service
are installed automatically inside its dedicated container.

These dependencies will be described later when we look at the camera brick.

## Understanding the two containers

When the application starts, App Lab runs two containers.

Their exact names depend on the name of the application, but they can be
identified by their final part:

- `main-1`
- `camera-1`

For this project, they have two clearly separated roles.

### The main container

The `main-1` container runs the main App Lab application.

It is responsible for:

- executing `python/main.py`;
- providing the App Lab runtime used by the application;
- managing the WebUI brick;
- making the files in `assets/` available to the WebUI.

The WebUI does not run in a separate third container.

The HTML, CSS and JavaScript files define the interface displayed in the
web browser, while `main.py` contains the main Python logic of the application.

In simple terms:

    Web browser
         │
         │ WebUI
         ▼
    ┌──────────────────────────────┐
    │ main-1 container             │
    │                              │
    │ python/main.py               │
    │ WebUI                        │
    │ assets/                      │
    │   index.html                 │
    │   app.js                     │
    │   style.css                  │
    └──────────────────────────────┘

### The camera container

The `camera-1` container is created by the custom `camera` brick.

Its main purpose is to isolate everything that is specific to the camera.

It runs `camera_service.py`, which:

- receives requests from the main application;
- configures the Linux camera pipeline;
- controls the IMX219 sensor;
- captures the RAW image;
- processes the image;
- returns the resulting JPEG image to the main application.

The additional Linux and Python dependencies required for these operations
are installed automatically inside this container.

In simple terms:

    ┌──────────────────────────────┐
    │ main-1 container             │
    │                              │
    │ main.py                      │
    └──────────────┬───────────────┘
                   │
                   │ local HTTP communication
                   ▼
    ┌──────────────────────────────┐
    │ camera-1 container           │
    │                              │
    │ camera_service.py            │
    │ V4L2 / Media Controller      │
    │ NumPy / Pillow               │
    └──────────────┬───────────────┘
                   │
                   ▼
                 IMX219
