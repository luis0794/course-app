import axios from "axios";

const baseUrl = 'http://localhost:8080/api/schoolYear';

export const findAllSchoolYear = async () => {
    const url = baseUrl.concat('/findAll')
    const response = await axios.get(url);
    return response.data;
};

export const findSchoolYearById = async (id) => {
    const url = baseUrl.concat(`/findById?id=${ id }`)
    const response = await axios.get(url);
    return response.data;
};

export const createSchoolYear = async (request) => {
    const url = baseUrl.concat('/createSchoolYear')
    const response = await axios.post(url, request);
    return response.data;
};

export const updateSchoolYear = async (request) => {
    const url = baseUrl.concat('/updateSchoolYear')
    await axios.post(url, request);
};

export const deleteSchoolYear = async (id) => {
    const url = baseUrl.concat(`/deleteSchoolYear?id=${ id }`)
    await axios.delete(url);
};




