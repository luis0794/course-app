import './App.css';
import {Breadcrumbs, Grid, Link, makeStyles, Paper} from '@material-ui/core';
import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

const PeriodAdmin = lazy(() => import('./components/period-admin/PeriodAdminComponent'));
const CourseAdmin = lazy(() => import('./components/course-admin/CourseAdminComponent'));
const InstructorAdmin = lazy(() => import('./components/instructor-admin/InstructorAdminComponent'));

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

function App() {
  const classes = useStyles();

  return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={2}/>

          <Grid item xs={8}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/periods">
                Periodos
              </Link>
              <Link color="inherit" href="/courses">
                Cursos
              </Link>
              <Link color="inherit" href="/instructors">
                Instructores
              </Link>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={2}/>

          <Grid item xs={2}/>

          <Grid item xs={8}>
            <Paper className={classes.paper}>
              <Router>
                <Suspense fallback={<div>Loading...</div>}>
                  <Switch>
                    <Route exact path="/" component={PeriodAdmin}/>
                    <Route exact path="/periods" component={PeriodAdmin}/>
                    <Route exact path="/courses" component={CourseAdmin}/>
                    <Route path="/instructors" component={InstructorAdmin}/>
                  </Switch>
                </Suspense>
              </Router>
            </Paper>
          </Grid>
        </Grid>
      </div>
  );
}

export default App;
