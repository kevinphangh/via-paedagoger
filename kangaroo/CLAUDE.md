# CLAUDE.md - AI Assistant Guide

This file provides essential guidance to Claude Code (claude.ai/code) when working with the Kangaroo Robot Control System.

## Project Overview

**Kangaroo Robot Control System** - A production warehouse automation system controlling a 3-axis gantry robot with vacuum gripper on Raspberry Pi:

```
┌──────────────────────────────────────────────────────┐
│                  System Components                    │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Frontend (/frontend/)                                │
│    ├── React 19 + Vite + Material-UI                  │
│    └── Real-time WebSocket control interface          │
│                                                        │
│  Backend (/backend/)                                  │
│    ├── FastAPI server with async Python               │
│    ├── Hardware interfaces (Arduino, I2C, GPIO)       │
│    └── SQLite task queue with WAL concurrency         │
│                                                        │
│  Firmware (/backend/firmware/)                        │
│    └── Arduino Mega 2560 real-time motor control      │
│                                                        │
└──────────────────────────────────────────────────────┘
```

## Essential Commands

### Development Workflow
```bash
# Backend development (from /backend/)
cd backend
python -m venv venv
source venv/bin/activate  # or: conda activate kangaroo
pip install -r requirements.txt
pip install -r tests/requirements-test.txt  # For testing
cd src && python main.py

# Frontend development (from /frontend/)
cd frontend
npm install
npm run dev

# Run specific test categories (from /backend/)
python -m pytest tests/unit/  # Unit tests only (safe, no hardware)
python -m pytest tests/integration/  # Integration tests
python -m pytest -m "not hardware"  # Skip hardware tests
python -m pytest --cov=src --cov-report=term-missing  # With coverage
python -m pytest tests/unit/core/test_motion_context_manager.py  # Single file

# Frontend tests (from /frontend/)
npm test  # Watch mode (Vitest)
npm test -- --run  # Single run
npm run test:coverage  # With coverage report
npm run test:ui  # Interactive UI

# Full test suite script (from /backend/)
chmod +x RUN_ALL_TESTS.sh && ./RUN_ALL_TESTS.sh
# Note: Update FRONTEND_DIR variable if frontend is not in default location
```

### Production Commands
```bash
# Backend production (from /backend/src/)
python main.py  # Starts FastAPI server on port 8000

# Frontend build and serve (from /frontend/)
npm run build
npx serve -s build -l 3000 --no-clipboard
# Or use nginx with provided config:
sudo ./setup-nginx.sh  # One-time setup
./deploy.sh  # Deploy to nginx
```

## System Architecture

### Layer Architecture
```
┌────────────────────────────────────────────────────────┐
│                  Frontend (React/Vite)                 │
└────────────────────────────────────────────────────────┘
                    ↕ WebSocket + REST API
┌────────────────────────────────────────────────────────┐
│               API Layer (FastAPI Routers)              │
│         /system/* /tasks/* /shelves/* /worker/*        │
└────────────────────────────────────────────────────────┘
                           ↕
┌────────────────────────────────────────────────────────┐
│                    Service Layer                       │
│    motion_service, pick_place_service, gripper_service │
└────────────────────────────────────────────────────────┘
                           ↕
┌────────────────────────────────────────────────────────┐
│                      Core Layer                        │
│  RobotStateManager, MotionContext, DatabaseManager     │
└────────────────────────────────────────────────────────┘
                           ↕
┌────────────────────────────────────────────────────────┐
│                   Hardware Layer                       │
│    Arduino (Serial), I2C Sensors, GPIO, USB Camera     │
└────────────────────────────────────────────────────────┘
```

### Key State Management Components

| Component | File | Purpose |
|-----------|------|---------|
| **RobotStateManager** | `src/core/robot_state_manager.py` | Single source of truth for robot state |
| **MotionContextManager** | `src/core/motion_context.py` | Prevents concurrent movements (mutex) |
| **DatabaseManager** | `src/core/database_manager.py` | SQLite task queue with WAL mode |
| **WebSocketManager** | `src/core/websocket_manager.py` | Real-time status broadcasts |
| **AppState** | `src/core/app_state.py` | Legacy compatibility layer |

## Critical Safety Systems

### ⚠️ NEVER Bypass or Modify These Systems

1. **Emergency Stop** (`robot_state_manager.py`)
   - Hardware GPIO triggers
   - Software command handling
   - Takes precedence over all operations

2. **Motion Context Mutex** (`motion_context.py`)
   - Prevents concurrent movements
   - Arduino cannot handle multiple commands
   - Automatic cleanup on errors

3. **Homing Requirements**
   - Robot must be homed before movements
   - Establishes absolute position reference
   - Workspace boundaries discovered during homing

4. **Movement Validation**
   - Coordinate bounds checking
   - Z-axis safe height enforcement (config.Z_MIDDLE_MM)
   - Timeout protection on all movements

### Arduino Communication Strategy
```
Movement Command Flow:
1. Acquire motion context lock
2. Pause status polling (prevent conflicts)
3. Send movement command
4. Wait for completion/timeout
5. Resume status polling
6. Release motion context lock
```

**Important**: No message IDs or sequence numbers - kept intentionally simple for reliability.

## Z-Axis Coordinate System (CRITICAL!)

```
Z-AXIS IS INVERTED - PAY ATTENTION:

Z = 0 (MIN)          Z = config.Z_MAX_MM
    │                        │
    ↓                        ↓
EXTENDED               RETRACTED
(at shelf)          (away from shelf)

• DECREASING Z = Moving TOWARD shelf (extending)
• INCREASING Z = Moving AWAY from shelf (retracting)
```

## Common Development Patterns

### Adding New Robot Operation
1. Add API endpoint in `src/api/routers/`
2. Implement service logic in `src/services/`
3. Update WebSocket broadcasts for status changes
4. Add frontend API call in `src/shared/services/`
5. Create/update React components with Material-UI
6. Write unit tests with hardware mocking

### Testing Requirements
- **Backend**: Mock ALL hardware interactions (no real Arduino/GPIO)
- **Frontend**: Use MSW for API mocking, React Testing Library
- **Arduino**: Firmware tests replace robot firmware (use caution!)
- Run `python -m pytest tests/unit/` for safe tests only

### Error Handling Pattern
- Services return structured error responses
- WebSocket broadcasts error states to frontend
- Emergency stop takes precedence over all operations
- State recovery on system restart

## Configuration Management

### Backend Configuration (`src/core/config.py`)
All hardware parameters are centralized in config.py:

| Category | Examples | Purpose |
|----------|----------|---------|
| **Motor Calibration** | `STEPS_PER_MM_X_A`, `STEPS_PER_MM_Y`, `STEPS_PER_MM_Z` | Steps per millimeter |
| **Movement Speeds** | `DEFAULT_MOVE_RPM_X/Y/Z`, `HOMING_RPM_X/Y/Z` | Motor speeds |
| **Acceleration** | `DEFAULT_ACCEL_MM_S2_X/Y/Z` | Smooth start/stop |
| **Z-Axis Positions** | `Z_MIDDLE_MM`, `Z_PICK_POSITION_MM`, `Z_PLACE_OFFSET_MM` | Critical positions |
| **Safety Settings** | `Z_AXIS_LIMIT_TIMEOUT_S`, `VACUUM_GRIP_THRESHOLD_PA` | Safety parameters |
| **Hardware Addresses** | `VACUUM_SENSOR_ADDRESS`, `SCMD_I2C_ADDRESS` | I2C device addresses |

### Environment Variables
```bash
# Development
export LOG_LEVEL=DEBUG
export DEV_SKIP_HOMING=True  # DEVELOPMENT ONLY - UNSAFE!

# Production
export ARDUINO_PORT=/dev/ttyACM0
export LOG_LEVEL=INFO
```

## Key Files Quick Reference

### Motion Control
- `src/services/motion_service.py` - High-level movement logic
- `src/utilities/low/motor_controller.py` - Arduino communication
- `src/core/motion_context.py` - Movement mutex and safety

### Task Processing
- `src/consumers/task_consumer.py` - SQL task queue worker
- `src/consumers/task_processor.py` - Task execution logic
- `src/core/database_manager.py` - Database operations

### Hardware Interfaces
- `src/utilities/low/arduino_controller.py` - Serial communication
- `src/utilities/low/vacuum_sensor.py` - I2C pressure sensor
- `src/services/gripper_service.py` - Vacuum and servo control

### Frontend Key Files
- `src/features/robot-control/RobotControlPage.jsx` - Main control interface
- `src/features/robot-status/RobotStatusPage.jsx` - Status monitoring interface
- `src/components/data/QueueTable.jsx` - Task queue display
- `src/contexts/WebSocketContext.jsx` - Real-time communication
- `src/shared/hooks/useWebSocket.js` - WebSocket management

## API Documentation & Testing

### API Documentation
- FastAPI automatic docs: `http://localhost:8000/docs` (Swagger UI)
- Alternative docs: `http://localhost:8000/redoc` (ReDoc)
- WebSocket endpoint: `ws://localhost:8000/robot/ws`

### Manual Firmware Management
```bash
# Check Arduino connection
ls /dev/ttyACM* /dev/ttyUSB*

# Upload firmware manually (from /backend/)
arduino-cli compile --fqbn arduino:avr:mega firmware/
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:mega firmware/

# Monitor Arduino serial output
arduino-cli monitor -p /dev/ttyACM0 -c baudrate=115200
```

### WebSocket Message Format
```javascript
// Status message from server
{
  "type": "status",
  "hardware_initialized": true,
  "homed": true,
  "emergency_stopped": false,
  "homing_in_progress": false,
  "position": {"x": 100.5, "y": 50.2, "z": 20.0},
  "vacuum_enabled": false,
  "worker_enabled": true,
  "held_item_id": "ABC123",
  "firmware_version": "v0.7.0",
  "workspace_bounds": {...},
  "timestamp": 1704067200.123
}

// Command to server
{"command": "get_status"}
```

## Debugging Quick Reference

### Common Issues & Solutions
| Issue | Solution |
|-------|----------|
| **Arduino not detected** | Check USB, verify `/dev/ttyACM*`, check dialout group |
| **I2C devices missing** | Run `sudo i2cdetect -y 1`, check pull-ups |
| **Movement blocked** | Check e-stop, verify homing completed |
| **Motion context stuck** | `curl -X POST localhost:8000/robot/system/clear_motion_context` |
| **Tests hanging** | Arduino tests active, use Ctrl+C |

### Essential Debug Commands
```bash
# System status
curl localhost:8000/robot/system/status | jq

# Monitor WebSocket
websocat ws://localhost:8000/robot/ws

# View logs
tail -f src/logs/app.log

# Check I2C devices
sudo i2cdetect -y 1

# Force emergency stop
curl -X POST localhost:8000/robot/system/e_stop
```

## Deployment Notes

### System Requirements
- Raspberry Pi 4/5 with GPIO access
- Arduino Mega 2560 with custom firmware
- Hardware: Stepper motors, vacuum system, limit switches, barcode camera
- System packages: `python3-lgpio`, `i2c-tools`

### Production Setup
- Backend runs as systemd service
- Frontend served by nginx with reverse proxy
- Database: SQLite with WAL mode for concurrency
- Hardware initialization automatic on startup

### Known Limitations
- Single robot per instance (no multi-robot support)
- Requires physical hardware for full operation
- Arduino firmware version must match backend expectations
- No authentication beyond simple token system

## Recent Major Changes (January 2025)
- Z-axis race condition fixed (status polling conflicts)
- Go-to-home now direct movement (not queued)
- WebSocket broadcast cleanup
- GPIO dependencies updated (lgpio package)
- Movement flag system enhanced for concurrency protection
- Config variables cleaned up (removed unused)
- Z_PLACE_OFFSET_MM now at 10.0mm for placement

## Important Reminders

1. **Always reference config.py** for hardware parameters - never hardcode values
2. **Test with mocked hardware** - use `pytest -m "not hardware"` for safe testing
3. **Respect the motion mutex** - never attempt concurrent movements
4. **Remember Z-axis is inverted** - Z=0 is extended, Z=MAX is retracted
5. **Check emergency stop state** before any movement operations
6. **Verify homing** before accepting movement commands
7. **Use structured logging** with appropriate log levels
8. **Update WebSocket broadcasts** when state changes
9. **Mock hardware in tests** - never run real hardware in unit tests
10. **Document config changes** - all hardware parameters live in config.py