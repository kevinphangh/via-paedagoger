# CLAUDE.md

AI assistant instructions for the Kangaroo Robot Control System.

## Overview

Warehouse robot control system with Python/FastAPI backend controlling a 3-axis gantry robot with vacuum gripper through Arduino on Raspberry Pi.

## Critical Safety ⚠️

**PHYSICAL ROBOTICS SYSTEM** - Safety requirements:
- **Z-AXIS INVERTED**: Z=0 is EXTENDED (dangerous), Z=MAX is RETRACTED (safe)
- **NEVER** bypass homing sequences or safety checks
- **NEVER** disable motion mutex (prevents concurrent movements)
- **ALWAYS** validate coordinates against workspace bounds
- **ALWAYS** ensure Z-axis retracted before lateral movements
- **EMERGENCY STOP** must remain functional at all times

## Quick Start

```bash
# Production (Raspberry Pi with hardware)
cd backend/src && python main.py

# Development (no hardware)
export HARDWARE_DISABLED=True DEV_SKIP_HOMING=True
cd backend/src && python main.py

# Frontend
cd frontend && npm run dev
```

## Project Structure

```
backend/src/
├── api/v1/          # REST endpoints
├── core/            # Managers, config, domain models
├── hardware/        # Controllers and abstractions
├── services/        # Business logic
└── utilities/       # Helpers and logging

frontend/src/
├── features/        # Page components
├── components/      # Reusable UI
├── contexts/        # React contexts
└── shared/          # Hooks, services, utils
```

## Key Commands

```bash
# Testing
./backend/tests/RUN_ALL_TESTS.sh        # All tests
pytest tests/unit/ -m "not hardware"    # Safe tests only

# Operations
POST /robot/system/home                 # Initialize robot
POST /robot/operations/move_box         # Move box between shelves
POST /robot/system/emergency_stop       # Emergency stop
POST /robot/system/clear_motion_context # Clear stuck mutex
```

## Configuration

All settings in `backend/src/core/config/settings.py` with environment overrides:
- Motor calibration: `STEPS_PER_MM_X/Y/Z`
- Speeds: `DEFAULT_MOVE_RPM_X/Y/Z`
- Z positions: `Z_MIDDLE_MM`, `Z_PICK_POSITION_MM`
- Safety: `VACUUM_GRIP_THRESHOLD_PA`

## Development Notes

- Mock ALL hardware in unit tests
- Mark hardware tests: `@pytest.mark.hardware`
- Import hardware only after setting `TEST_MODE=1`
- Check workspace bounds before movements
- Use motion mutex for all movements

## Recent Changes (2024-2025)

- Merged pick/place/pick_and_place → single `move_box` operation
- Centralized all config in settings.py with env overrides
- Added Arduino firmware auto-upload capability
- Cleaned up 100+ duplicate files and empty directories

## Resources

- API Docs: `http://localhost:8000/docs`
- WebSocket: `ws://localhost:8000/robot/ws`
- Logs: `backend/src/logs/application.log`