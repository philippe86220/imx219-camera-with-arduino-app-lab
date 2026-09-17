# IMX219 Camera with Arduino App Lab

## Project overview

This project demonstrates how to use a Sony IMX219 camera with Arduino App Lab and the Media Carrier.

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
