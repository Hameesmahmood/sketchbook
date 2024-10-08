import  { useState, useRef, useEffect } from "react";
import {
  Download,
  Eraser,
  PenTool,
  Trash2,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import Birb from "./images/Birds.png";
import Cat from "./images/cat.png";
import Flower from "./images/flower.png";

import "./App.css";

function App() {
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  const [brushType, setBrushType] = useState("round");
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [background, setBackground] = useState(null);

  const placeholderImages = [Birb, Cat, Flower];

  const predefinedColors = [
   "#000000",  // Black
  "#FFFFFF",  // White
  "#FF0000",  // Red
  "#00FF00",  // Green
  "#0000FF",  // Blue
  "#FFFF00",  // Yellow
  "#FF00FF",  // Magenta
  "#00FFFF",  // Cyan
  "#FFA500",  // Orange
  "#800080",  // Purple
  "#008000",  // Dark Green
  "#FFC0CB",  // Pink
  "#A52A2A",  // Brown
  "#FFD700",  // Gold
  "#B0E0E6",  // Powder Blue
  "#DC143C",  // Crimson
  "#8A2BE2",  // Blue Violet
  "#00FA9A",  // Medium Spring Green
  "#FF4500",  // Orange Red
  "#2E8B57",  // Sea Green
  "#6A5ACD",  // Slate Blue
  "#D2691E",  // Chocolate
  "#FF6347",  // Tomato
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      context.lineCap = brushType;
      context.strokeStyle = color;
      context.lineWidth = lineWidth;

      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [color, lineWidth, brushType, background, history, historyIndex]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (background) {
      drawBackground();
    }

    if (history.length > 0 && historyIndex >= 0) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex].canvasData;
    }
  };

  const drawBackground = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = background;
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;

    const context = contextRef.current;
    context.globalCompositeOperation = isErasing
      ? "destination-out"
      : "source-over";
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    setBackground(null);
    saveToHistory();
  };

  const setBackgroundImage = (src) => {
    setBackground(src);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.onload = () => {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveToHistory();
    };
    img.src = src;
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "sketchbook.png";
    link.href = image;
    link.click();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      canvasData: canvas.toDataURL(),
      background: background,
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = isErasing ? "#FFFFFF" : color;
      contextRef.current.lineCap = brushType;
    }
  }, [color, brushType, isErasing]);

  useEffect(() => {
    redrawCanvas();
  }, [background, historyIndex]);

  const handleToolChange = (newIsErasing) => {
    setIsErasing(newIsErasing);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setIsErasing(false);
  };

  return (
    <div className="sketchbook">
      <h1>My Sketchbook</h1>
      <div className="sketchbook-container">
        <div className="toolbox">
          <div className="tool-item">
            <label>
              <PenTool size={16} />
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </div>
          <div className="tool-item">
            <label>
              <PenTool size={16} />
              Size
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
            />
          </div>
          <div className="tool-item">
            <label>Brush Type</label>
            <select
              value={brushType}
              onChange={(e) => setBrushType(e.target.value)}
            >
              <option value="round">Round</option>
              <option value="square">Square</option>
              <option value="butt">Flat</option>
            </select>
          </div>
          <button
            className={`btn eraser-btn ${isErasing ? "active" : ""}`}
            onClick={() => handleToolChange(!isErasing)}
          >
            <Eraser size={16} />
            {isErasing ? "Draw" : "Erase"}
          </button>
          <button className="btn" onClick={clearCanvas}>
            <Trash2 size={16} />
            Clear Canvas
          </button>
          <div className="undo-redo-container">
            <button className="btn" onClick={undo} disabled={historyIndex <= 0}>
              <RotateCcw size={16} />
              Undo
            </button>
            <button
              className="btn"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <RotateCw size={16} />
              Redo
            </button>
          </div>
          <button onClick={saveCanvas} className="btn">
            <Download size={16} />
            Save Image
          </button>
          <div className="color-palette">
            {predefinedColors.map((presetColor, index) => (
              <button
                key={index}
                className="color-btn"
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorChange(presetColor)}
              />
            ))}
          </div>
        </div>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
          />
        </div>

        <div className="sidebar">
          <h2>Choose a Background</h2>
          <div className="image-selection">
            {placeholderImages.map((src, index) => (
              <div
                className="image-box"
                key={index}
                onClick={() => setBackgroundImage(src)}
              >
                <img src={src} alt={`Placeholder ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
