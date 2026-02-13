import { useEffect, useRef } from "react";

export default function Orb({ listening, onToggle }) {
  const canvasRef = useRef(null);
  let t = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 320;
    canvas.height = 320;

    function draw() {
      t += listening ? 0.025 : 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = 90;
      const points = 120;

      // Gradient (multicolor glass)
      const gradient = ctx.createRadialGradient(
        cx - 30,
        cy - 30,
        40,
        cx,
        cy,
        160
      );
      gradient.addColorStop(0, "#ff9a9e");
      gradient.addColorStop(0.4, "#fad0c4");
      gradient.addColorStop(0.7, "#a18cd1");
      gradient.addColorStop(1, "#5f2c82");

      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;

        const wave =
          Math.sin(angle * 3 + t * 2) * (listening ? 14 : 6) +
          Math.sin(angle * 6 - t) * (listening ? 10 : 4);

        const r = baseRadius + wave;
        const x = cx + Math.cos(angle + t * 0.3) * r;
        const y = cy + Math.sin(angle + t * 0.3) * r;

        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.shadowColor = "rgba(255,255,255,0.35)";
      ctx.shadowBlur = 25;
      ctx.fill();

      // Gloss highlight
      ctx.beginPath();
      ctx.ellipse(cx - 30, cy - 40, 55, 35, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fill();

      requestAnimationFrame(draw);
    }

    draw();
  }, [listening]);

  return (
    <div className="orb-container" onClick={onToggle}>
      <canvas ref={canvasRef} />
    </div>
  );
}
