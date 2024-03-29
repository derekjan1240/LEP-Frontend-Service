import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import {
  Paper,
  Box,
  Grid,
  Button,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  makeStyles,
} from "@material-ui/core";

// Icon
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";

// Components
import PageHeader from "../../Utility/compmnents/PageHeader";
import OperatorMenu from "../../Utility/compmnents/OperatorMenu";
import ClassroomForm from "../compmnents/classroom/ClassroomForm";
import Popup from "../../Utility/compmnents/Popup";

const useStyles = makeStyles((theme) => ({
  pageContent: {
    margin: theme.spacing(5),
    padding: theme.spacing(3),
  },
  menuButton: {
    marginRight: 16,
  },
  media: {
    height: 140,
    margin: "15%",
    backgroundSize: "contain",
  },
  classRoomButton: {
    background: "aliceblue",
    padding: 16,
  },
}));

function EntryCard({ classroom }) {
  const classes = useStyles();
  const navigate = useNavigate();

  const handleOnClick = (herf) => {
    navigate(herf);
  };

  return (
    <Card>
      <CardActionArea
        className={classes.classRoomButton}
        onClick={() => {
          handleOnClick(`/classroom/${classroom.id}`);
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item md={2}>
            <CardMedia className={classes.media} image="/Classroom.svg" />
          </Grid>
          <Grid item md={10}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                <b>{classroom.name}</b>
              </Typography>
              <Typography variant="h5" gutterBottom>
                班級人數: {classroom.studentList.length} 人
              </Typography>
              <hr />
              <Box component="div" whiteSpace="pre">
                <Typography variant="h6">{classroom.description}</Typography>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}

export default function Classrooms() {
  const classes = useStyles();

  // 登入檢查
  const navigate = useNavigate();
  const userState = useSelector((state) => state.userState);

  useEffect(() => {
    if (!userState.user && !userState.isChecking) {
      navigate("/auth/login");
    }

    if (userState.user) {
      axios({
        method: "GET",
        url: `${process.env.REACT_APP_CONTENT_SERVICE}/classrooms`,
        headers: {
          token: `${localStorage.jwt}`,
          user: `${userState.user._id}`,
        },
      })
        .then((result) => {
          setClassrooms(result.data);
        })
        .catch((err) => {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "讀取班級列表失敗!",
          });
        });
    }
  }, [userState]);

  const [classrooms, setClassrooms] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {}, []);

  const handleAdd = (newClassroom, resetForm) => {
    resetForm();
    setOpenPopup(false);
    newClassroom.manager = userState.user._id;
    console.log("newClassroom:", newClassroom);

    axios({
      method: "POST",
      url: `${process.env.REACT_APP_CONTENT_SERVICE}/classrooms`,
      headers: {
        token: `${localStorage.jwt}`,
        user: `${userState.user._id}`,
      },
      data: {
        ...newClassroom,
        isAllowAdd: newClassroom.isAllowAdd === "1",
      },
      withCredentials: true,
    })
      .then((result) => {
        const clonedClassrooms = classrooms.slice(0);
        clonedClassrooms.push(result.data);
        setClassrooms(clonedClassrooms);
        Swal.fire({
          icon: "success",
          title: `新增班級 ${result.data.name} 成功!`,
          width: 700,
        });
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "新增班級失敗!",
        });
      });
  };

  const handleJoinClassroom = () => {
    Swal.fire({
      title: "請輸入班級 ID",
      input: "text",
      inputLabel: "班級 ID",
      confirmButtonText: "加入",
      inputValidator: (value) => {
        if (!value) {
          return "請確實輸入班級 ID";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios({
          method: "POST",
          url: `${process.env.REACT_APP_CONTENT_SERVICE}/classrooms/join`,
          headers: {
            token: `${localStorage.jwt}`,
            user: `${userState.user._id}`,
          },
          data: {
            classroom: result.value,
          },
        }).then((result) => {
          const clonedClassrooms = classrooms.slice(0);
          clonedClassrooms.push(result.data);
          setClassrooms(clonedClassrooms);
          Swal.fire({
            icon: "success",
            title: `加入班級 ${result.data.name} 成功!`,
            width: 700,
          });
        });
      }
    });
  };

  return (
    <>
      <PageHeader
        title="班級系統"
        subTitle="班級列表"
        icon={<SupervisedUserCircleIcon fontSize="large" />}
      />
      <OperatorMenu>
        {(userState?.user?.role === "Admin" ||
          userState?.user?.role === "Teacher" ||
          userState?.user?.role === "Parent") && (
          <Button
            variant="contained"
            color="primary"
            className={classes.menuButton}
            onClick={() => {
              setOpenPopup(true);
            }}
          >
            建立班級
          </Button>
        )}
        {userState?.user?.role === "Student" && (
          <Button
            variant="contained"
            color="primary"
            className={classes.menuButton}
            onClick={handleJoinClassroom}
          >
            加入班級
          </Button>
        )}
      </OperatorMenu>
      {!userState.isChecking && (
        <Paper className={classes.pageContent}>
          <Grid container spacing={3}>
            {classrooms.map((classroom) => {
              return (
                <Grid item md={12} key={classroom.id}>
                  <EntryCard classroom={classroom} />
                </Grid>
              );
            })}
          </Grid>
          <Popup
            title="新增班級"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
          >
            <ClassroomForm handleAddOrEdit={handleAdd} />
          </Popup>
        </Paper>
      )}
    </>
  );
}
