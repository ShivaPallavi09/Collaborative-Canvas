class Whiteboard {
    constructor(canvasId, onDrawCallback, onMoveCallback) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.onDrawCallback = onDrawCallback;
        this.onMoveCallback = onMoveCallback;
        
        // State
        this.isDrawing = false;
        this.currentStrokeId = null; // NEW: Tracks the current "session" of drawing
        this.lastX = 0;
        this.lastY = 0;
        
        // Configuration
        this.color = '#000000';
        this.lineWidth = 3;

        this.handleResize = this.handleResize.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.init();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseout', this.handleMouseUp);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Stop scrolling
            const pos = this.getTouchPos(e);
            // Simulate mousedown
            this.handleMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Stop scrolling
            // Simulate mousemove
            this.handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            this.handleMouseUp();
        });
    }
    
    handleResize() {
        const parent = this.canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        this.ctx.scale(dpr, dpr);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handleMouseDown(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // NEW: Generate a unique ID for this entire stroke
        this.currentStrokeId = Date.now() + Math.random().toString(36);
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        // 1. Emit cursor movement (Always)
        if (this.onMoveCallback) {
            this.onMoveCallback({ x: pos.x, y: pos.y });
        }

        // 2. Drawing logic
        if (!this.isDrawing) return;
        
        this.draw(this.lastX, this.lastY, pos.x, pos.y, this.color, this.lineWidth);
        
        if (this.onDrawCallback) {
            this.onDrawCallback({
                x0: this.lastX,
                y0: this.lastY,
                x1: pos.x,
                y1: pos.y,
                color: this.color,
                width: this.lineWidth,
                strokeId: this.currentStrokeId // NEW: Send the stroke ID
            });
        }
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    handleMouseUp() {
        this.isDrawing = false;
        this.currentStrokeId = null; // Reset
    }

    draw(x0, y0, x1, y1, color, width) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawRemote(data) {
        this.draw(data.x0, data.y0, data.x1, data.y1, data.color, data.width);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
        // Note: We divide by dpr because we scaled the context earlier
        // actually, simpler is to use the raw canvas dimensions:
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // Helper to get touch coordinates
    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0]; // Get the first finger
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
}