# Identia — Identity + Skill Attestations on Solana

**Identia** is a Solana-native platform that lets young people (16–28) learn skills, prove them through quizzes, and receive **on-chain attestations** via the Solana Attestation Service (SAS).

## Live Demo

- **Frontend:** https://identia-mvp.vercel.app
- **API:** https://identia-api.onrender.com/health

## What it does

1. User connects a Solana wallet (Phantom / Solflare)
2. Completes short React lessons + a timed quiz
3. Requests a skill attestation (level based on score)
4. Admin reviews the request (wallet-signed auth)
5. Admin emits the attestation **on-chain** (SAS)
6. User sees a vintage-style certificate linked to their wallet

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React + Vite + Tailwind + Solana Wallet Adapter |
| Backend | Node.js (Express) on Render |
| Database | Supabase |
| Auth Admin | Message signature + Supabase Edge Function |
| Blockchain | Solana Devnet + SAS (sas-lib + gill) |

## Architecture

User → Lessons → Quiz → Request (Supabase)
↓
Admin (signature) → Validate → Emit on-chain (API)
↓
SAS Attestation on Solana


## Key addresses (Devnet)

- Credential PDA: `GyABNtVxbzVVsGnut4wkj3bgNMMvci3r63D4DaECuSTk`
- Schema PDA: `4Xc4WQn54Ej6HjtBhQ3XgcxrTwpcvUFNMdLiJtGk8Cnq`

## How to demo

1. Open https://identia-mvp.vercel.app
2. Connect Phantom (Devnet)
3. Go to **Apprendre React** → complete lessons + quiz
4. Request attestation
5. (Admin) Connect Authority wallet → Sign message → Admin panel
6. Click **Émettre on-chain**
7. Check **Mes Attestations** for the certificate

## Built for

Colosseum Crypto World's Fair Hackathon — Solana track

