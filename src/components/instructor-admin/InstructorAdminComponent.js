import React, {Component} from 'react';
import {FieldControl, FieldGroup, FormBuilder, FormControl, Validators} from 'react-reactive-form';
import {
    Button,
    Grid,
    Input,
    InputLabel,
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
    createInstructor,
    deleteInstructor,
    findAllInstructors,
    updateInstructor
} from '../../common/services/InstructorService';
import './InstructorAdminComponent.css';
import {Alert} from '@material-ui/lab';

export default class InstructorAdminComponent extends Component {

    form = FormBuilder.group({
        name: ["", Validators.required],
        identification: ["", Validators.required]
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
            page: 0,
            rowsPerPage: 10,
            columns: [
                {
                    id: 'identification',
                    label: 'Identificación',
                    align: 'justify'
                },
                {
                    id: 'name',
                    label: 'Nombre',
                    align: 'justify'
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
                                <EditIcon className="opt editOpt" onClick={() => this.editInstructor(row) }/>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                                <DeleteIcon className="opt deleteOpt" onClick={() => this.deleteInstructor$(valueColumn) }/>
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

    continueToCreateInstructor = () => {
        this.setState({ onEdit: true });
    }

    findAll = () => {
        findAllInstructors()
            .then(value => this.setState({ rows: value }))
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al buscar todos los instructores..");
            })
    }

    createInstructor$ = () => {
        createInstructor(this.form.value)
            .then(newInstructor => {
                this.showSuccess('Instructor creado.');
                const actualRows = [...this.state.rows];
                actualRows.push(newInstructor);

                this.setState({rows: actualRows});
            })
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al crear el instructor.");
            });
    }

    updateInstructor$ = (instructorUpdated) => {
        updateInstructor(this.form.value)
            .then(() => {
                this.showSuccess('Instructor actualizado.');
                const actualRows = [...this.state.rows];
                let row = actualRows.find(r => r.id === instructorUpdated.id);
                row.identification = instructorUpdated.identification;
                row.name = instructorUpdated.name;

                this.setState({rows: actualRows});
            })
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al actualizar el instructor.");
            });
    }

    deleteInstructor$ = (instructorId) => {
        deleteInstructor(instructorId)
            .then(() => {
                this.showSuccess('Instructor eliminado.');
                let actualRows = [...this.state.rows];
                actualRows = actualRows.filter(r => r.id !== instructorId)

                this.setState({rows: actualRows});
            })
            .catch(err => {
                console.error(err);
                this.showError("Ocurrió un error al eliminar el instructor.");
            });
    }


    editInstructor = (instructor) => {
        this.setState({ onEdit: true, isUpdating: true });
        this.form.patchValue({
            name: instructor.name,
            identification: instructor.identification
        });

        this.form.setControl('id', new FormControl(instructor.id))
    }

    cancelEditInstructor = () => {
        this.finalizeEdit();
    }

    saveInstructor = async () => {
        if (this.form.valid) {
            await this.state.isUpdating ? this.updateInstructor$(this.form.value) : this.createInstructor$();
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
                                            <h2>Instructores</h2>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FieldControl
                                                name="identification"
                                                render={this.InputText}
                                                meta={{ label: "Identificación", OnEdit: this.state.onEdit }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FieldControl
                                                name="name"
                                                render={this.InputText}
                                                meta={{ label: "Nombre", OnEdit: this.state.onEdit }}
                                            />
                                        </Grid>
                                    </Grid>
                                </form>
                            )}/>

                            {
                                !this.state.onEdit ?
                                    <Grid item xs={12}>
                                        <Button variant="contained" color="primary" className="full-width createBtn" onClick={() => this.continueToCreateInstructor()}>
                                            Crear
                                        </Button>
                                    </Grid> : ''
                            }

                            {
                                this.state.onEdit ?
                                    <Grid item xs={6}>
                                        <Button variant="contained" color="secondary" className="full-width cancelBtn" onClick={() => this.cancelEditInstructor()}>
                                            Cancelar
                                        </Button>
                                    </Grid> : ''
                            }

                            {
                                this.state.onEdit ?
                                    <Grid item xs={6}>
                                        <Button variant="contained" color="primary" className="full-width saveBtn" onClick={() => this.saveInstructor()}>
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
