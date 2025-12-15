# **App Name**: Smart Climate Tracker

## Core Features:

- Data Acquisition: Fetch temperature and humidity readings from the ESP32 sensor via custom API endpoint.
- Real-time Display: Display current temperature and humidity using gauges.
- Historical Data Graph: Visualize temperature and humidity data over time using interactive graphs.
- Timestamp Logging: Record timestamps for each sensor reading.
- Data Prototyping: Display randomized dummy data on initial load, or if a data connection is unavailable, for prototyping purposes.
- Periodic Data Archival: Store sensor readings every hour for daily reporting.
- Daily Report Export: Automatically send a daily report (24-hour data) to Google Sheets and reset the timestamp on the web.

## Style Guidelines:

- Primary color: Soft blue (#7EC8E3) to evoke a sense of calm and represent temperature.
- Background color: Very light desaturated blue (#F0F8FF). to complement the primary color without distracting.
- Accent color: Muted orange (#E6A87B), to draw attention to important data and contrasts the primary color.
- Body and headline font: 'Inter', a sans-serif font, providing a modern and clean feel for readability and clarity.
- Use simple, clear icons to represent temperature, humidity, and data transmission status.
- Responsive layout to ensure readability on various devices.
- Smooth transitions when updating data and refreshing the graph.