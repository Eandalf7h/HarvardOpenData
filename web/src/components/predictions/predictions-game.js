/** @jsx jsx */
import React from 'react';
import { Card, jsx, Text, Input, Label, Grid } from "theme-ui";
import firebase from "gatsby-plugin-firebase";
import { useList, useObject } from "react-firebase-hooks/database";
import Spacer from "../../components/core/spacer";
import IntervalChoice from "./questions/interval-choice";
import MultipleCategoryChoice from "./questions/multiple-category-choice";
import Leaderboard from "./leaderboard";
import Login from "../users/login";

const PredictionsGame = ({user}) => {
  const [snapshot, loading, error] = useObject(
    firebase.database().ref("predictions_users/" + user.uid)
  );
  const [questions, questionsLoading, questionsError] = useList(
    firebase.database().ref("predictions/questions")
  );
  const [scores, scoresLoading, scoresError] = useList(
      firebase.database().ref("predictions_users/" + user.uid + "/score")
  );
  const [name, nameLoading, nameError] = useObject(
      firebase.database().ref("predictions/leaderboard/" + user.uid)
  );

  if (snapshot && !snapshot.exists()) {
    if (!questionsLoading) {
      let initial = {};
      let initialScore = {};
      initial["score"] = {};
      questions.forEach((question) => (initial["score"][question.key] = 0));
      initialScore["nickname"] = user.displayName;
      initialScore["score"] = 0;
      firebase
        .database()
        .ref("predictions_users/" + user.uid)
        .set(initial);
      firebase
          .database()
          .ref("predictions/leaderboard/" + user.uid)
          .update(initialScore);
    }
  }

  // answer is the index of the choice for MC questions, or the correct number for range questions
  function calculateScore(isMC, prediction, answer, qid, range) {
    let score = 0;
    const scale = 60;
    let total = 0;
    let updates = {};
    let leaderboardUpdates = {};

    if (answer && prediction) {
      if (isMC) {
        if (prediction.length === 1) {
          // binary scoring
          if (answer) {
            score = (1 - prediction[0] / 100) ** 2 * 2;
          } else {
            score = (prediction[0] / 100) ** 2 * 2;
          }
          score = -score * scale + scale / 2;
        } else {
          // multi-category scoring
          for (let i = 0; i < prediction.length; i++) {
            if (i === answer) {
              score += (1 - prediction[i] / 100) ** 2;
            } else {
              score += (prediction[i] / 100) ** 2;
            }
          }
          score =
            -score * scale +
            (scale * (prediction.length - 1)) / prediction.length;
        }
      } else {
        // range-based scoring
        if (answer >= prediction[0] && answer <= prediction[1]) {
          score =
            (scale / 2) *
            (1 - (prediction[1] - prediction[0]) / (range[1] - range[0]));
        }
      }
      updates[qid] = score;
      firebase
        .database()
        .ref("predictions_users/" + user.uid + "/score")
        .update(updates)
        .then(() => {
          if (!scoresError && !scoresLoading) {
            scores.forEach((score) => total += score.val());
            leaderboardUpdates["score"] = total;
            firebase
                .database()
                .ref("predictions/leaderboard/" + user.uid)
                .update(leaderboardUpdates);
          }
        });
    }
    return score;
  }

  function displayScore(score, explanation) {
    return (
      <p>
        <Text> {explanation} </Text>
        <Text>
          You received <strong>{score ? score.toFixed(2) : 0}</strong> points
          for this prediction.
        </Text>
      </p>
    );
  }

  function renderQuestion(question, date_expired, answer, disabled) {
    const qid = question.key;
    const prediction = snapshot.child(qid).val();

    if (question.child("type").val() === "mc") {
      const choices = question.child("choices").val();
      const score = calculateScore(true, prediction, answer, qid);
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
            name={questionsLoading ? "Loading..." : question.child("name").val()}
            uid={user.uid}
            qid={qid}
            date_expired={date_expired}
            choices={choices}
            prediction={prediction}
            explanation={answer && displayScore(score, question.child("explanation").val())}
            // disabled={disabled}
          />
        </Card>
      );
    } else {
      const range = question.child("choices").val();
      const score = calculateScore(false, prediction, answer, qid, range);
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
            name={questionsLoading ? "Loading..." : question.child("name").val()}
            uid={user.uid}
            qid={qid}
            lower={range[0]}
            upper={range[1]}
            date_expired={date_expired}
            prediction={prediction}
            explanation={answer && displayScore(score, question.child("explanation").val())}
            // disabled={disabled}
          />
        </Card>
      );
    }
  }

  let liveQuestions = [];
  let pendingQuestions = [];
  let scoredQuestions = [];

  questions.forEach((question) => {
    const date_expired = question.child("date_expired").val();
    let answer = question.child("answer").val();
    if (answer) {
      answer = parseInt(answer);
    }

    if (new Date(date_expired).getTime() > new Date().getTime()) {
      liveQuestions.push(renderQuestion(question, date_expired, answer, false));
    } else if (
      new Date(date_expired).getTime() < new Date().getTime() &&
      !answer
    ) {
      pendingQuestions.push(
        renderQuestion(question, date_expired, answer, true)
      );
    } else if (
      new Date(date_expired).getTime() < new Date().getTime() &&
      answer
    ) {
      scoredQuestions.push(
        renderQuestion(question, date_expired, answer, true)
      );
    }
  });

  const handleChange = (e) =>
    firebase
      .database()
      .ref("predictions/leaderboard/" + user.uid)
      .update({
        nickname: e.target.value,
      });

  return (
    <Grid gap={5} columns={["3fr 1fr"]}>
      <div>
        <p style={{ marginTop: 0, padding: 0}}>
          Can you forsee the future? Weigh in on our Predictions game and compete for glory on the scoreboard!
        </p>
        <Login />
        <Spacer height={1}/>
        {error && <strong>Error: {error}</strong>}
        {questionsError && <strong>Error: {questionsError}</strong>}
        {user &&
          <div>
            <p>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                name="displayName"
                sx={{ width: "30%"}}
                value={nameLoading ? "Loading..." : name.child("nickname").val()}
                onChange={handleChange}
              />
            </p>
            <Spacer height={2}/>
            <Text sx={{ fontSize: 3, fontWeight: "bold"}}>Live predictions</Text>
            <Text>How likely are each of these events?</Text>
            {liveQuestions}
            <Spacer height={5}/>
            <Text sx={{ fontSize: 3, fontWeight: "bold"}}>Pending predictions</Text>
            <Text>The deadline to edit your responses has passed. Check back soon to see the results!</Text>
            {pendingQuestions}
            <Spacer height={5}/>
            <Text sx={{ fontSize: 3, fontWeight: "bold"}}>Scored predictions</Text>
            <Text>How accurate were your predictions?</Text>
            {scoredQuestions}
          </div>
        }
      </div>
      <div>
        <Leaderboard user={user}/>
      </div>
    </Grid>
  );
};

export default PredictionsGame;
