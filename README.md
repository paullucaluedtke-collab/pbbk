# Bürokratie Killer (Receipt Extractor)

An intelligent receipt data extraction tool for small businesses, powered by OpenAI GPT-4o Vision.

## Features
- **Drag & Drop Upload**: Easy interface for receipt images.
- **AI Extraction**: Automatically extracts Date, Vendor, Category, Tax, and Total.
- **Hybrid AI Logic**: Uses cost-effective GPT-4o-mini by default, auto-upgrades to GPT-4o for complex receipts.
- **CSV Export**: Compatible with Excel/Tax software.
- **Privacy**: Processing happens on-demand via your own API key.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure API Key**:
    -   Copy `.env.local.example` to `.env.local`:
        ```bash
        cp .env.local.example .env.local
        ```
    -   Add your OpenAI API Key (`sk-...`).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open Application**:
    Navigate to `http://localhost:3000`.

## Tech Stack
-   **Next.js 14** (App Router)
-   **React**
-   **TypeScript**
-   **CSS Modules** (Professional, Vanilla CSS)
-   **OpenAI API**
