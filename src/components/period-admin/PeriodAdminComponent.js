import React, {Component} from 'react';
import {FieldControl, FieldGroup, FormBuilder, FormControl, Validators} from 'react-reactive-form';
import {
    Button,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    createSchoolYear,
    deleteSchoolYear,
    findAllSchoolYear,
    findSchoolYearById,
    updateSchoolYear
} from '../../common/services/SchoolYearService';
import './PeriodAdminComponent.css'
import {findAllCourses} from '../../common/services/CourseService';
import {findAllInstructors} from '../../common/services/InstructorService';
import MuiAlert from '@material-ui/lab/Alert';

export default class PeriodAdminComponent extends Component {

    form = FormBuilder.group({
        courseId: [undefined, Validators.required],
        instructorId: [undefined, Validators.required],
        year: [undefined, Validators.required],
    });

    InputSelect = ({ handler, touched, hasError, meta }) => {
        if (meta.isCourse) {
            return <div>
                        <InputLabel className="input-label">Curso</InputLabel>
                        <Select
                            className="normal-input-width"
                            value={20}
                            readOnly={!this.state.onEdit}
                            placeholder={meta.label}
                            {...handler()}>
                            { this.state.courses.map((c, i) =>
                                (<MenuItem key={'opt-cour'.concat(i.toString())} value={c.id}>{ c.name }</MenuItem>)) }
                        </Select>

                        <span className="span-error">
                                {touched
                                && hasError("required")
                                && `${meta.label} requerido`}
                            </span>
                    </div>
        }

        if (meta.isInstructor) {
            return <div>
                <InputLabel className="input-label">Instructor</InputLabel>
                <Select
                    className="normal-input-width"
                    value={20}
                    readOnly={!this.state.onEdit}
                    {...handler()}>
                    { this.state.instructors.map((c, i) =>
                        (<MenuItem key={'opt-inst'.concat(i.toString())} value={c.id}>{ c.name }</MenuItem>)) }
                </Select>

                <span className="span-error">
                                {touched
                                && hasError("required")
                                && `${meta.label} requerido`}</span>
            </div>
        }

        if (meta.isSchoolYear) {
            return <div>
                <InputLabel className="input-label">Periodo</InputLabel>
                <Select
                    className="normal-input-width"
                    value={20}
                    readOnly={!this.state.onEdit}
                    {...handler()}>
                    { Array(10).fill(2021).map((x, y) =>
                        <MenuItem key={'opt-year'.concat(y.toString())} value={x + y}>{ x + y }</MenuItem>) }
                </Select>

                <span className="span-error">
                                {touched
                                && hasError("required")
                                && `${meta.label} requerido`}
                            </span>
            </div>
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            onEdit: false,
            isUpdating: false,
            page: 0,
            rowsPerPage: 10,
            columns: [
                {
                    id: 'instructorName',
                    label: 'Instructor',
                    align: 'justify'
                },
                {
                    id: 'courseName',
                    label: 'Curso',
                    align: 'justify'
                },
                {
                    id: 'year',
                    label: 'Periodo',
                    align: 'center'
                },
                {
                    id: 'opts',
                    label: '',
                    align: 'center'
                },
            ],
            rows: [],
            table: {
                opts: (column, valueColumn, row) => {
                    return column.id === 'opts' ?
                        <div style={{ display: this.state.onEdit ? 'none' : 'initial' }}>
                            <Tooltip title="Editar">
                                <EditIcon className="opt editOpt" onClick={() => this.editSchoolYear(row) }/>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                                <DeleteIcon className="opt deleteOpt" onClick={() => this.deleteSchoolYear$(valueColumn) }/>
                            </Tooltip>
                        </div>
                        :  valueColumn
                }
            },
            courses: [],
            instructors: [],
            snackBar: {
                show: false,
                type: 'success',
                message: ''
            }
        }
    }

    componentDidMount() {
        this.findAll();
        this.findAllCourses();
        this.findAllInstructors();
    }

    continueToCreateSchoolYear = () => {
        this.setState({ onEdit: true });
    }

    findAll = () => {
        findAllSchoolYear()
            .then(value => this.setState({ rows: value }))
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al buscar todos los periodos.");
            });
    }

    findAllCourses = () => {
        findAllCourses()
            .then(value => this.setState({ courses: value }))
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al buscar todos los cursos.");
            });
    }

    findAllInstructors = () => {
        findAllInstructors()
            .then(value => this.setState({ instructors: value }))
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al buscar todos los instructores.");
            });
    }

    createSchoolYear$ = () => {
        const coincidences = this.state.rows.filter(p =>
            p.courseId === this.form.value.courseId && p.instructorId === this.form.value.instructorId && p.year === this.form.value.year);

        if (coincidences.length > 0) {
            this.showInfo("Existe una asginación para el instructor y curso en el periodo seleccionado.");
        } else {
            createSchoolYear({
                courseId: this.form.value.courseId,
                instructorId: this.form.value.instructorId,
                year: this.form.value.year
            }).then(newSchoolYear => {
                const actualRows = [...this.state.rows];
                this.showSuccess('Periodo creado.');

                findSchoolYearById(newSchoolYear.id)
                    .then(schoolYear => {
                        actualRows.push(schoolYear);

                        this.setState({rows: actualRows});
                        this.finalizeEdit();
                    })
                    .catch(err => {
                        console.error(err);
                        this.showError("Ocurrió un error al buscar el periodo nuevo.");
                    });
            }).catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al crear el periodo.");
            });
        }
    }

    updateSchoolYear$ = (schoolYearUpdated) => {
        const coincidences = this.state.rows.filter(p =>
            p.courseId === this.form.value.courseId
            && p.instructorId === this.form.value.instructorId
            && p.year === this.form.value.year);

        if (coincidences.length > 0) {
            this.showInfo("Existe una asginación para el instructor y curso en el periodo seleccionado.");
        } else {
            updateSchoolYear(
                {
                    id: schoolYearUpdated.id,
                    courseId: schoolYearUpdated.courseId,
                    instructorId: schoolYearUpdated.instructorId,
                    year: schoolYearUpdated.year
                }).then(() => {
                    this.showSuccess('Periodo actualizado.');
                    const actualRows = [...this.state.rows];

                    findSchoolYearById(schoolYearUpdated.id)
                        .then(schoolYear => {
                            let row = actualRows.find(r => r.id === schoolYearUpdated.id);
                            row.courseName = schoolYear.courseName;
                            row.instructorName = schoolYear.instructorName;
                            row.year = schoolYear.year;

                            this.setState({rows: actualRows});
                            this.finalizeEdit();
                        })
                        .catch(err => {
                            console.error(err);
                            this.showError("Ocurrió un error al buscar el periodo actualizado.");
                        });
            }).catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al actualizar el periodo.");
            });
        }
    }

    deleteSchoolYear$ = (schoolYearId) => {
        deleteSchoolYear(schoolYearId)
            .then(() => {
                this.showSuccess('Periodo eliminado.');
                let actualRows = [...this.state.rows];
                actualRows = actualRows.filter(r => r.id !== schoolYearId)

                this.setState({rows: actualRows});
            })
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al eliminar el periodo.");
            });
    }

    editSchoolYear = (schoolYear) => {
        this.setState({ onEdit: true, isUpdating: true });
        this.form.patchValue({
            courseId: schoolYear.courseId,
            instructorId: schoolYear.instructorId,
            year: schoolYear.year
        });

        this.form.setControl('id', new FormControl(schoolYear.id))
    }

    cancelEditSchoolYear = () => {
        this.finalizeEdit();
    }

    saveSchoolYear = () => {
        if (this.form.valid) {
            this.state.isUpdating ? this.updateSchoolYear$(this.form.value) : this.createSchoolYear$();
        } else {
            this.showError("Campos iválidos.");
        }
    }

    finalizeEdit = () => {
        this.setState({ onEdit: false, isUpdating: false });
        this.form.reset();
    }

    showSuccess = (message) => {
        this.setState({
            snackBar: {
                show: true,
                type: 'success',
                message
            }
        })

        setTimeout(() => this.setState({ snackBar: { show: false } }), 4000)
    }

    showInfo = (message) => {
        this.setState({
            snackBar: {
                show: true,
                type: 'info',
                message
            }
        })

        setTimeout(() => this.setState({ snackBar: { show: false } }), 4000)
    }

    showError = (message) => {
        this.setState({
            snackBar: {
                show: true,
                type: 'error',
                message
            }
        })

        setTimeout(() => this.setState({ snackBar: { show: false } }), 4000)
    }

    render() {
        return (
            <div className="full-width">
                <Snackbar key={'snack-bar-key'}
                          open={this.state.snackBar.show}
                          autoHideDuration={4000}
                          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert severity={this.state.snackBar.type}>
                        {this.state.snackBar.message}
                    </Alert>
                </Snackbar>

                <Grid container spacing={3}>
                    <Grid item xs={5}>
                        <Grid container spacing={3}>
                            <FieldGroup
                                control={this.form} render={({ get, invalid }) => (
                                <form>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <h2>Periodo escolar</h2>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FieldControl
                                                name="instructorId"
                                                render={this.InputSelect}
                                                meta={{ label: "Instructor", isInstructor: true }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FieldControl
                                                name="courseId"
                                                render={this.InputSelect}
                                                meta={{ label: "Curso", isCourse: true, dataSource: this.state.courses }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FieldControl
                                                name="year"
                                                render={this.InputSelect}
                                                meta={{ label: "Periodo escolar", isSchoolYear: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                </form>
                            )}/>

                            {
                                !this.state.onEdit ?
                                    <Grid item xs={12}>
                                        <Button variant="contained" color="primary" className="full-width createBtn" onClick={() => this.continueToCreateSchoolYear()}>
                                            Crear
                                        </Button>
                                    </Grid> : ''
                            }

                            {
                                this.state.onEdit ?
                                    <Grid item xs={6}>
                                        <Button variant="contained" color="secondary" className="full-width cancelBtn" onClick={() => this.cancelEditSchoolYear()}>
                                            Cancelar
                                        </Button>
                                    </Grid> : ''
                            }

                            {
                                this.state.onEdit ?
                                    <Grid item xs={6}>
                                        <Button variant="contained" color="primary" className="full-width saveBtn" onClick={() => this.saveSchoolYear()}>
                                            Guardar
                                        </Button>
                                    </Grid> : ''
                            }
                        </Grid>
                    </Grid>

                    <Grid item xs={7}>
                        <TableContainer className="container">
                            <Table stickyHeader aria-label="sticky table" className="table-admin">
                                <TableHead>
                                    <TableRow>
                                        {this.state.columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}>
                                                {column.id === 'opts' ? '' : column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.rows.map((row, i) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={'row-'.concat(i)}>
                                                {this.state.columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            { this.state.table.opts(column, column.id === 'opts' ? row.id : value, row) }
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </div>
        );
    }

}

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
