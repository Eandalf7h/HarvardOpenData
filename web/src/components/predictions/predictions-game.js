/** @jsx jsx */
import React, { useEffect, useState } from "react";
import { Card, jsx, Text, Input, Label, Grid, Button, Box } from "theme-ui";
import firebase from "gatsby-plugin-firebase";
import { useList, useObject } from "react-firebase-hooks/database";
import Spacer from "../../components/core/spacer";
import IntervalChoice from "./questions/interval-choice";
import MultipleCategoryChoice from "./questions/multiple-category-choice";
import Leaderboard from "./leaderboard";
import Login from "../users/login";

const PredictionsGame = ({ user }) => {
  const [snapshot, loading, error] = useObject(
    firebase.database().ref("predictions_users/" + user.uid)
  );
  const [questions, questionsLoading, questionsError] = useList(
    firebase.database().ref("predictions/questions")
  );
  const [name, nameLoading, nameError] = useObject(
    firebase.database().ref("public/" + user.uid)
  );
  const [scores, scoresLoading, scoresError] = userObject(
      firebase.database().ref("leaderboard/" + user.uid)
  );


  // state hook for display name change
  const [displayName, setDisplayName] = useState(user.displayName);
  const [borderColor, setBorderColor] = useState();
  const [borderWidth, setBorderWidth] = useState(1);

  useEffect(() => {
    setDisplayName(nameLoading ? displayName : name.child("nickname").val());
  }, [nameLoading]);

  // add user to firebase if doesn't exist
  if (snapshot && !snapshot.exists()) {
      const info = { "name": user.displayName, "email": user.email };
      const publicInfo = {"displayName": user.displayName};

      firebase
        .database()
        .ref("users/" + user.uid)
        .update(info);
      firebase
        .database()
        .ref("public/" + user.uid)
        .update(publicInfo);
  }

  function displayScore(score, explanation) {
    return (
      <div>
        <Text> {explanation} </Text>
        <Text>
          You received <strong>{score ? score.toFixed(2) : 0}</strong> points
          for this prediction.
        </Text>
      </div>
    );
  }

  // render appropriate component for each question
  function renderQuestion(question, date_expired, answer, disabled) {
    const qid = question.key;
    const prediction = snapshot.child(qid).val();

    if (question.child("type").val() === "mc") {
      const choices = question.child("choices").val();
      const score = scores.child("score").val() ? scores.child("score").val()[qid] : 0;
      return (
        <Card
          key={qid}
          sx={{
            mt: 3,
            borderRadius: 5,
            backgroundColor: "light",
            padding: 4,
            boxShadow: "0 0 8px rgba(0, 0, 0, 0.125)",
          }}
        >
          <MultipleCategoryChoice
            name={
              questionsLoading ? "Loading..." : question.child("name").val()
            }
            uid={user.uid}
            qid={qid}
            date_expired={date_expired}
            choices={choices}
            prediction={prediction}
            explanation={
                scoresLoading ? "Loading..." :
                    (answer !== null && displayScore(score, question.child("explanation").val()))
            }
            disabled={disabled}
          />
        </Card>
      );
    } else {
      const range = question.child("choices").val();
      const score = scores.child("score").val() ? scores.child("score").val()[qid] : 0;
      return (
        <Card
          key={qid}
          sx={{
            mt: 3,
            borderRadius: 5,
            backgroundColor: "light",
            padding: 4,
            boxShadow: "0 0 8px rgba(0, 0, 0, 0.125)",
          }}
        >
          <IntervalChoice
            name={
              questionsLoading ? "Loading..." : question.child("name").val()
            }
            uid={user.uid}
            qid={qid}
            lower={range[0]}
            upper={range[1]}
            date_expired={date_expired}
            prediction={prediction}
            explanation={
                scoresLoading ? "Loading..." :
                    (answer !== null && displayScore(score, question.child("explanation").val()))
            }
            disabled={disabled}
          />
        </Card>
      );
    }
  }

  // sort questions by live, pending, and scored
  let liveQuestions = [];
  let pendingQuestions = [];
  let scoredQuestions = [];

  questions.sort(
    (a, b) =>
      new Date(a.child("date_expired").val()).getTime() -
      new Date(b.child("date_expired").val()).getTime()
  );

  questions.forEach((question) => {
    const date_expired = question.child("date_expired").val();
    let answer = question.child("answer").val();
    if (answer !== null) {
      answer = parseInt(answer);
    }

    if (new Date(date_expired).getTime() > new Date().getTime()) {
      liveQuestions.push(renderQuestion(question, date_expired, answer, false));
    } else if (
      new Date(date_expired).getTime() < new Date().getTime() &&
      answer == null
    ) {
      pendingQuestions.push(
        renderQuestion(question, date_expired, answer, true)
      );
    } else if (
      new Date(date_expired).getTime() < new Date().getTime() &&
      answer !== null
    ) {
      scoredQuestions.push(
        renderQuestion(question, date_expired, answer, true)
      );
    }
  });

  // validate display name on change
  const validateName = () => {
    if (displayName !== "") {
      firebase
        .database()
        .ref("public/" + user.uid)
        .update({
          "displayName": displayName,
        });
      setBorderColor("green");
    } else {
      setBorderColor("red");
    }
    setBorderWidth(1.6);
    setTimeout(() => {
      setBorderColor("");
      setBorderWidth(1);
    }, 3000);
  };

  return (
    <Grid gap={5} columns={["3fr 1fr"]}>
      <div>
        <Text sx={{ fontSize: 1, pb: 3 }}>
          Can you forsee the future? Weigh in on our Predictions game and
          compete for glory on the scoreboard!
        </Text>
        <Login />
        <Spacer height={1} />
        {error && <strong>Error: {error}</strong>}
        {questionsError && <strong>Error: {questionsError}</strong>}
        {scoresError && <strong>Error: {scoresError}</strong>}
        {user && (
          <div>
            <Box sx={{ pt: 3, pb: 3 }}>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                name="displayName"
                sx={{
                  borderColor: borderColor,
                  borderWidth: borderWidth,
                  width: "30%",
                  display: "inline",
                }}
                value={nameError ? user.displayName : displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                    validateName();
                  }
                }}
              />
              <Button sx={{ display: "inline" }} onClick={validateName}>
                Change
              </Button>
            </Box>
            <Spacer height={2} />
            {loading ? (
              "Loading..."
            ) : (
              <div>
                <Text sx={{ fontSize: 3, fontWeight: "bold" }}>
                  Live predictions
                </Text>
                <Text sx={{ fontSize: 1 }}>How likely are each of these events?</Text>
                {liveQuestions}
                <Spacer height={5} />
                <Text sx={{ fontSize: 3, fontWeight: "bold" }}>
                  Pending predictions
                </Text>
                <Text sx={{ fontSize: 1 }}>
                  The deadline to edit your responses has passed. Check back
                  soon to see the results!
                </Text>
                {pendingQuestions}
                <Spacer height={5} />
                <Text sx={{ fontSize: 3, fontWeight: "bold" }}>
                  Scored predictions
                </Text>
                <Text sx={{ fontSize: 1 }}>How accurate were your predictions?</Text>
                {scoredQuestions}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <Leaderboard user={user} />
      </div>
    </Grid>
  );
};

export default PredictionsGame;
