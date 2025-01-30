# Three.js Experiments

A collection of interactive 3D experiments using Three.js, showcasing various WebGL capabilities and geometric shapes.

## Features

- **Cone Visualization**: Interactive 3D cone with dynamic lighting
  - Orbital controls for camera movement
  - Animated rectangular area light
  - Adjustable material properties

- **Torus Knot Visualization**: Interactive 3D torus knot with dynamic lighting
  - Orbital controls for camera movement
  - Animated rectangular area light
  - Custom material properties and colors

## Prerequisites

- Node.js and yarn installed on your system
- Modern web browser with WebGL support
- Python 3.x (for running the local server)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/three-js-experiments.git
cd three-js-experiments
```

2. Install dependencies:
```bash
yarn install
```

## Running the Project

1. Start the local server:
```bash
python3 -m http.server
```

2. Open your web browser and navigate to:
- Main page: http://localhost:8000
- Cone visualization: http://localhost:8000/cone.html
- Torus knot visualization: http://localhost:8000/taurusknot.html

## Controls

- **Mouse Controls**:
  - Left click + drag: Rotate camera
  - Right click + drag: Pan
  - Scroll wheel: Zoom in/out

## Technical Details

- Built with Three.js version 0.158.0
- Uses ES6 modules
- Implements modern WebGL features:
  - Shadow mapping
  - Dynamic lighting
  - Area lights
  - Material properties

## Project Structure

```
three-js-experiments/
├── js/
│   ├── cone.js         # Cone visualization logic
│   └── taurusknot.js   # Torus knot visualization logic
├── css/
│   └── main.css        # Styling
├── *.html              # HTML entry points
├── package.json        # Project dependencies
└── README.md          # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Ensure your browser supports WebGL and ES6 modules.

## License

MIT License - feel free to use this code for your own projects.

