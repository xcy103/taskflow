// Registers jest-dom matchers (toBeInTheDocument, etc.) and cleans up the DOM
// between tests.
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
