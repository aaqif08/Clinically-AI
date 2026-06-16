import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1'
})

export const analyzeNote = (data) => API.post('/analyze-sync', data)
export const getPatientHistory = (patientId) => API.get('/patient/' + patientId + '/history')
export const getHbA1cTrend = (patientId) => API.get('/patient/' + patientId + '/hba1c-trend')
