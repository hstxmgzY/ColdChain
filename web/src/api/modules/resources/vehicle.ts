import  VehicleType from "../../../interface/resource/vehicle"
 import { http } from "../../request"
 
 export const getVehicleList = async () => {
     const response = await http.get<VehicleType[]>('/resource/vehicle/list')
     return response
 }
 
 export const addVehicle = (vehicleData: VehicleType) => {
     return http.post('/resource/vehicle/add', vehicleData)
 }
 
 export const updateVehicle = (vehicleId: number, updatedData: VehicleType) => {
     return http.put(`/resource/vehicle/update/${vehicleId}`, updatedData)
 }
 
 export const deleteVehicle = async (vehicleId: number) => {
     return http.delete(`/resource/vehicle/delete/${vehicleId}`)
 }