import axios from "axios";

const baseUrl = 'http://localhost:8080/api/course';

export const findAllCourses = async () => {
    const url = baseUrl.concat('/findAll')
    const response = await axios.get(url);
    return response.data;
};

export const findById = async (id) => {
    const url = baseUrl.concat(`/findById?id=${ id }`)
    const response = await axios.get(url);
    return response.data;
};

export const createCourse = async (request) => {
    const url = baseUrl.concat('/createCourse')
    const response = await axios.post(url, request);
    return response.data;
};

export const updateCourse = async (request) => {
    const url = baseUrl.concat('/updateCourse')
    await axios.post(url, request);
};

export const deleteCourse = async (id) => {
    const url = baseUrl.concat(`/deleteCourse?id=${ id }`)
    await axios.delete(url);
};




