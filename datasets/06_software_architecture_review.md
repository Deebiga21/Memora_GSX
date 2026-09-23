# 06. Software Architecture Review

Date: September 25, 2026
Project: Campus Smart Mobility Initiative
Lead: Ravi Menon

## 1. Overview
The technical team met to review the proposed software architecture for the NovaTech Mobility App and the Centralized Fleet Management Dashboard.

## 2. Architecture Components
- **Frontend:** React Native for iOS and Android applications.
- **Backend:** Node.js with Express, hosted on AWS.
- **Database:** PostgreSQL for user and route data; Redis for real-time location caching.
- **IoT Integration:** MQTT protocol for real-time telemetry from shuttle GPS modules.

## 3. Security Considerations
- All endpoints must be secured using OAuth 2.0.
- Data in transit will be encrypted via TLS 1.3.
- Database access is restricted to internal VPC only.

## 4. Action Items
- Finalize the API contracts between the frontend and backend teams.
- Provision the AWS testing environments.
- Conduct a security review of the proposed MQTT broker configuration.
