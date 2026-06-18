const fs = require('fs');

const api = `import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

const API = axios.create({ baseURL: BASE_URL })

export const analyzeNote = (data) => API.post('/analyze-sync', data)
export const getPatientHistory = (patientId) => API.get('/patient/' + patientId + '/history')
export const getRiskTrend = (patientId) => API.get('/patient/' + patientId + '/risk-trend')
export const assessDischargeRisk = (data) => API.post('/discharge-risk', data)`;

fs.writeFileSync('src/services/api.js', api, 'utf8');
console.log('api.js fixed successfully!');