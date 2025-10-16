# Test Fixtures

This directory contains test data and assets used in automated tests.

## Structure

- `images/` - Sample photos for testing photo capture and upload
- `data/` - JSON fixtures for testing data operations
- `mocks/` - Mock data for Firebase and API responses

## Usage

```typescript
import { samplePhoto } from './fixtures/images/sample-hand.jpg';
import { mockUserData } from './fixtures/data/users.json';
```

## Adding New Fixtures

1. Add files to appropriate subdirectory
2. Keep file sizes small (< 100KB for images)
3. Use realistic but anonymized data
4. Document fixture purpose in this README
