# 🦘 Kangaroo - Warehouse Automation Robot

3-axis gantry robot system for automated warehouse operations with vacuum gripper, barcode scanning, and real-time web interface.

## System Components

- **[Backend](backend/)** - FastAPI control system on Raspberry Pi
- **[Frontend](frontend/)** - React 19 web interface  
- **Arduino** - Real-time motor control (Mega 2560)
- **Hardware** - 3-axis gantry, vacuum gripper, barcode scanner

## Quick Start

### Backend
```bash
cd backend/src && python main.py
```

### Frontend
```bash
cd frontend && npm install && npm run dev
```

Access at **http://localhost:3000** (frontend) and **http://localhost:8000/docs** (API)

## Key Features

- ✅ Automated pick and place operations
- ✅ Barcode scanning for inventory tracking
- ✅ Real-time WebSocket status updates
- ✅ Emergency stop safety system
- ✅ Task queue with priority management
- ✅ Web-based control interface
- ✅ Comprehensive safety interlocks

## Documentation

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [API Reference](backend/docs/API.md)
- [Safety Systems](backend/docs/CRITICAL_SAFETY.md)
- [AI Assistant Instructions](CLAUDE.md)

## Safety Notice

⚠️ **PHYSICAL ROBOTICS SYSTEM** - This controls real hardware. Always ensure:
- Emergency stop is accessible (GPIO Pin 7)
- Homing completed before operations
- Z-axis safety (inverted coordinates)
- Motion mutex protection active

## License

Proprietary - All rights reserved