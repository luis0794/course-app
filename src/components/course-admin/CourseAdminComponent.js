import {
    Button,
    Grid,
    Input,
    InputLabel,
    makeStyles,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import React, {Component} from 'react';
import {createCourse, deleteCourse, findAllCourses, updateCourse} from '../../common/services/CourseService';
import './CourseAdminComponent.css';
import {FieldControl, FieldGroup, FormBuilder, FormControl, Validators} from "react-reactive-form";
import {Alert} from '@material-ui/lab';

export default class CourseAdminComponent extends Component {

    form = FormBuilder.group({
        name: ["", Validators.required],
        description: [""]
    });

    InputText = ({ handler, touched, hasError, meta }) => (
        <div>
            <InputLabel className="input-label">{meta.label}</InputLabel>
            <Input className="normal-input-width"
                   placeholder={`Ingrese ${meta.label}`}
                   inputProps={{ 'aria-label': 'description' }}
                   readOnly={!this.state.onEdit} {...handler()}/>

            <span className="span-error">
                {touched
                && hasError("required")
                && `${meta.label} requerido`}
            </span>
        </div>
    )

    constructor(props) {
        super(props);

        this.state = {
            onEdit: false,
            isUpdating: false,
            classes: makeStyles((theme) => ({
                root: {
                    flexGrow: 1,
                },
                paper: {
                    padding: theme.spacing(2),
                    textAlign: 'center',
                    color: theme.palette.text.secondary,
                },
                createBtn: {
                    width: '100%'
                },
                cancelBtn: {
                    width: '100%'
                },
                saveBtn: {
                    width: '100%'
                },
                textField: {
                    width: '100%'
                }
            })),
            page: 0,
            rowsPerPage: 10,
            columns: [
                {
                    id: 'name',
                    label: 'Nombre',
                    minWidth: '40%',
                    align: 'justify'
                },
                {
                    id: 'description',
                    label: 'Descripción',
                    minWidth: '50%',
                    align: 'justify'
                },
                {
                    id: 'opts',
                    label: '',
                    minWidth: '30px',
                    align: 'justify'
                },
            ],
            rows: [],
            table: {
                opts: (column, valueColumn, row) => {
                    return column.id === 'opts' ?
                        <div style={{ display: this.state.onEdit ? 'none' : 'initial' }}>
                            <Tooltip title="Editar">
                                <EditIcon className="opt editOpt" onClick={() => this.editCourse(row) }/>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                                <DeleteIcon className="opt deleteOpt" onClick={() => this.deleteCourse$(valueColumn) }/>
                            </Tooltip>
                        </div>
                        :  valueColumn
                }
            },
            snackBar: {
                show: false,
                type: 'success',
                message: ''
            }
        }
    }

    componentDidMount() {
        this.findAll();
    }

    handleChangePage = (event, newPage) => this.setState({ page: newPage });

    handleChangeRowsPerPage = (event) => {
        this.setState({ rowsPerPage: +event.target.value });
        this.setState({ page: 0 })
    };

    continueToCreateCourse = () => {
        this.setState({ onEdit: true });
    }

    findAll = () => {
        findAllCourses()
            .then(value => this.setState({ rows: value }))
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al buscar todos los cursos.");
            });
    }

    createCourse$ = () => {
        createCourse(this.form.value)
            .then(newCourse => {
                this.showSuccess('Curso creado.');
                const actualRows = [...this.state.rows];
                actualRows.push(newCourse);
                
                this.setState({rows: actualRows});
            })
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al crear el curso.");
            });
    }

    updateCourse$ = (courseUpdated) => {
        updateCourse(this.form.value)
            .then(() => {
                this.showSuccess('Curso actualizado.');
                const actualRows = [...this.state.rows];
                let row = actualRows.find(r => r.id === courseUpdated.id);
                row.name = courseUpdated.name;
                row.description = courseUpdated.description;

                this.setState({rows: actualRows});
            })
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al actualizar el curso.");
            });
    }

    deleteCourse$ = (courseId) => {
        deleteCourse(courseId)
            .then(() => {
                this.showSuccess('Curso eliminado.');
                let actualRows = [...this.state.rows];
                actualRows = actualRows.filter(r => r.id !== courseId)

                this.setState({rows: actualRows});
            })
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al eliminar el curso.");
            });
    }


    editCourse = (course) => {
        this.setState({ onEdit: true, isUpdating: true });
        this.form.patchValue({
            name: course.name,
            description: course.description
        });

        this.form.setControl('id', new FormControl(course.id))
    }

    cancelEditCourse = () => {
        this.finalizeEdit();
    }

    saveCourse = async () => {
        if (this.form.valid) {
            await this.state.isUpdating ? this.updateCourse$(this.form.value) : this.createCourse$();
            this.finalizeEdit();
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
                                                <h2>Cursos</h2>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FieldControl
                                                    name="name"
                                                    render={this.InputText}
                                                    meta={{ label: "Nombre", OnEdit: this.state.onEdit }}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <FieldControl
                                                    name="description"
                                                    render={this.InputText}
                                                    meta={{ label: "Descripción", OnEdit: this.state.onEdit }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </form>
                            )}/>

                            {
                                !this.state.onEdit ?
                                <Grid item xs={12}>
                                    <Button variant="contained" color="primary" className="full-width createBtn" onClick={() => this.continueToCreateCourse()}>
                                        Crear
                                    </Button>
                                </Grid> : ''
                            }

                            {
                                this.state.onEdit ?
                                <Grid item xs={6}>
                                    <Button variant="contained" color="secondary" className="full-width cancelBtn" onClick={() => this.cancelEditCourse()}>
                                        Cancelar
                                    </Button>
                                </Grid> : ''
                            }

                            {
                                this.state.onEdit ?
                                <Grid item xs={6}>
                                    <Button variant="contained" color="primary" className="full-width saveBtn" onClick={() => this.saveCourse()}>
                                        Guardar
                                    </Button>
                                </Grid> : ''
                            }
                        </Grid>
                    </Grid>

                    <Grid item xs={7}>
                        <TableContainer className="container">
                            <Table stickyHeader aria-label="sticky table" className="table-admin table-courses">
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
