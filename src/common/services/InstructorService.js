import axios from "axios";

const baseUrl = 'http://localhost:8080/api/instructor';

export const findAllInstructors = async () => {
    const url = baseUrl.concat('/findAll')
    const response = await axios.get(url);
    return response.data;
};

export const findById = async (id) => {
    const url = baseUrl.concat(`/findById?id=${ id }`)
    const response = await axios.get(url);
    return response.data;
};

export const createInstructor = async (request) => {
    const url = baseUrl.concat('/createInstructor')
    const response = await axios.post(url, request);
    return response.data;
};

export const updateInstructor = async (request) => {
    const url = baseUrl.concat('/updateInstructor')
    await axios.post(url, request);
};

export const deleteInstructor = async (id) => {
    const url = baseUrl.concat(`/deleteInstructor?id=${ id }`)
    await axios.delete(url);
};




