import React, { useEffect, useRef, useState } from "react";

const PendulumGrid = () => {
  const canvasRef = useRef(null);

  // State variables for user controls
  const [gravity, setGravity] = useState(1.0);
  const [lengthMultiplier, setLengthMultiplier] = useState(0.7); // Reduced lengths
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  // Function to update canvas and pendulums' scale based on window size
  const updateCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const squareSize = Math.min(canvas.width, canvas.height) * 0.7; // 70% of the smaller dimension
    const squareX = (canvas.width - squareSize) / 2; // Center horizontally
    const squareY = (canvas.height - squareSize) / 2; // Center vertically
  
    const pendulumCount = 81;
    const gridSize = Math.ceil(Math.sqrt(pendulumCount));
    const cellSize = squareSize / gridSize; // Grid cell size
  
    return { ctx, squareSize, squareX, squareY, gridSize, cellSize };
  };
  

  useEffect(() => {
    const { ctx, squareSize, squareX, squareY, gridSize, cellSize } = updateCanvas();

    const timeStep = 0.05;

    // Initialize pendulums with starting angles pointing downward
    const pendulums = Array.from({ length: 81 }, (_, i) => ({
      pendulum1: {
        length: Math.min(cellSize * 0.4, (Math.random() * 4 + 10) * lengthMultiplier), // Smaller pendulums
        angle: Math.PI / 2, // Starting angle pointing downward
        velocity: 0,
        mass: Math.random() * 1.5 + 0.5, // Smaller masses
      },
      pendulum2: {
        length: Math.min(cellSize * 0.4, (Math.random() * 5 + 20) * lengthMultiplier), // Smaller pendulums
        angle: Math.PI / 2, // Starting angle pointing downward
        velocity: 0,
        mass: Math.random() * 1.5 + 0.5, // Smaller masses
      },
      origin: {
        x: squareX + (i % gridSize) * cellSize + cellSize / 2,
        y: squareY + Math.floor(i / gridSize) * cellSize + cellSize / 2,
      },
    }));

    const drawPendulums = () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
      // Draw the square with a modern gradient and a subtle shadow
      ctx.fillStyle = "rgba(20, 20, 20, 0.9)"; // Darker shade with some transparency
      ctx.fillRect(squareX, squareY, squareSize, squareSize);
    
      // Draw border with a glowing effect for a modern feel
      ctx.strokeStyle = "#444"; // Dark border with light glow
      ctx.lineWidth = 4;
      ctx.strokeRect(squareX, squareY, squareSize, squareSize);
    
      pendulums.forEach(({ pendulum1, pendulum2, origin }) => {
        const x1 = origin.x + pendulum1.length * Math.sin(pendulum1.angle);
        const y1 = origin.y + pendulum1.length * Math.cos(pendulum1.angle);
    
        const x2 = x1 + pendulum2.length * Math.sin(pendulum2.angle);
        const y2 = y1 + pendulum2.length * Math.cos(pendulum2.angle);
    
        // Draw first stick
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    
        // Draw second stick
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    
        // Draw masses
        ctx.fillStyle = "black";
        ctx.beginPath();
        // ctx.arc(x1, y1, pendulum1.mass * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        // ctx.arc(x2, y2, pendulum2.mass * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const updatePendulums = () => {
      pendulums.forEach(({ pendulum1, pendulum2 }) => {
        const num1 = -gravity * (2 * pendulum1.mass + pendulum2.mass) * Math.sin(pendulum1.angle);
        const num2 = -pendulum2.mass * gravity * Math.sin(pendulum1.angle - 2 * pendulum2.angle);
        const num3 = -2 * Math.sin(pendulum1.angle - pendulum2.angle) * pendulum2.mass;
        const num4 =
          pendulum2.velocity ** 2 * pendulum2.length +
          pendulum1.velocity ** 2 * pendulum1.length * Math.cos(pendulum1.angle - pendulum2.angle);
        const den1 =
          pendulum1.length *
          (2 * pendulum1.mass +
            pendulum2.mass -
            pendulum2.mass * Math.cos(2 * pendulum1.angle - 2 * pendulum2.angle));
        const a1_acc = (num1 + num2 + num3 * num4) / den1;

        const num5 = 2 * Math.sin(pendulum1.angle - pendulum2.angle);
        const num6 = pendulum1.velocity ** 2 * pendulum1.length * (pendulum1.mass + pendulum2.mass);
        const num7 = gravity * (pendulum1.mass + pendulum2.mass) * Math.cos(pendulum1.angle);
        const num8 = pendulum2.velocity ** 2 * pendulum2.length * pendulum2.mass * Math.cos(pendulum1.angle - pendulum2.angle);
        const den2 =
          pendulum2.length *
          (2 * pendulum1.mass +
            pendulum2.mass -
            pendulum2.mass * Math.cos(2 * pendulum1.angle - 2 * pendulum2.angle));
        const a2_acc = (num5 * (num6 + num7 + num8)) / den2;

        pendulum1.velocity += a1_acc * timeStep * speedMultiplier;
        pendulum2.velocity += a2_acc * timeStep * speedMultiplier;

        pendulum1.angle += pendulum1.velocity * timeStep;
        pendulum2.angle += pendulum2.velocity * timeStep;

        pendulum1.velocity *= 1; // Damping
        pendulum2.velocity *= 1; // Damping
      });
    };

    const animate = () => {
      drawPendulums();
      updatePendulums();
      requestAnimationFrame(animate);
    };

    animate();

    // Event listener to update canvas on window resize
    const handleResize = () => {
      const { ctx, squareSize, squareX, squareY, gridSize, cellSize } = updateCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gravity, lengthMultiplier, speedMultiplier]);

  return (
    <div>
  <canvas ref={canvasRef} />
  <div className="title">
    Admist the chaos
  </div>
  <div className="controls">
    <label>
      Gravity:
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={gravity}
        onChange={(e) => setGravity(parseFloat(e.target.value))}
      />
      {gravity.toFixed(1)}
    </label>
    <label>
      Length Multiplier:
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={lengthMultiplier}
        onChange={(e) => setLengthMultiplier(parseFloat(e.target.value))}
      />
      {lengthMultiplier.toFixed(1)}
    </label>
    <label>
      Speed Multiplier:
      <input
        type="range"
        min="0.1"
        max="3"
        step="0.1"
        value={speedMultiplier}
        onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
      />
      {speedMultiplier.toFixed(1)}
    </label>
  </div>
</div>


  );
};

export default PendulumGrid;
