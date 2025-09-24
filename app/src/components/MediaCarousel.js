import React from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function MediaCarousel({ media = [] }) {
  const [index, setIndex] = React.useState(0);
  if (!media.length) return null;
  const current = media[index];
  const isImage = current.type === "image";
  const isVideo = current.type === "video";
  const goPrev = () => setIndex(i => (i === 0 ? media.length - 1 : i - 1));
  const goNext = () => setIndex(i => (i === media.length - 1 ? 0 : i + 1));
  return (
    <Box sx={{ position: "relative", width: "100%", maxHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", mt: 1 }}>
      {media.length > 1 && (
        <IconButton onClick={goPrev} sx={{ position: "absolute", left: 8, top: "50%", zIndex: 2, background: "#fff8", ':hover': { background: '#ede9fe' } }}>
          <ArrowBackIosNewIcon />
        </IconButton>
      )}
      {isImage && (
        <img src={current.url} alt="media" style={{ maxHeight: 400, borderRadius: 12, objectFit: "cover", width: "100%" }} />
      )}
      {isVideo && (
        <video src={current.url} controls style={{ maxHeight: 400, borderRadius: 12, width: "100%" }} />
      )}
      {media.length > 1 && (
        <IconButton onClick={goNext} sx={{ position: "absolute", right: 8, top: "50%", zIndex: 2, background: "#fff8", ':hover': { background: '#ede9fe' } }}>
          <ArrowForwardIosIcon />
        </IconButton>
      )}
      <Box sx={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 1 }}>
        {media.map((_, i) => (
          <Box key={i} sx={{ width: 10, height: 10, borderRadius: "50%", background: i === index ? "#7c3aed" : "#ede9fe", border: "1.5px solid #a78bfa" }} />
        ))}
      </Box>
    </Box>
  );
}
