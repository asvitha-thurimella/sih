import React from "react";
import Paper from "@material-ui/core/Paper";
import ReactPlayer from "react-player";
import Style from "./Style";

export default function Post({ userId, text, type, audioURL, fileData, fileType, createdAt }) {
  const classes = Style();

  return (
    <Paper className={classes.post}>
      <div className={classes.post__body}>
        {/* TEXT MESSAGE */}
        {type === "text" && <p className={classes.body__description}>{text}</p>}

        {/* IMAGE OR VIDEO */}
        {fileData && (
          <div className={classes.body__image}>
            {fileType === "image" && <img src={fileData} alt="post" />}
            {fileType === "video" && <ReactPlayer url={fileData} controls width="100%" />}
          </div>
        )}

        {/* AUDIO MESSAGE */}
        {type === "audio" && audioURL && (
          <audio controls style={{ width: "100%", marginTop: "10px" }}>
            <source src={audioURL} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </Paper>
  );
}
