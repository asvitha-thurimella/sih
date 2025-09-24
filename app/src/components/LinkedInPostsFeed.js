import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOCATIONS, PROFESSIONS } from "../pages/CreateProfile.js";
import MediaCarousel from "./MediaCarousel.js";
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Avatar,
  Typography,
  Grid,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from "@mui/material";


import MessageIcon from "@mui/icons-material/Message";
import DeleteIcon from "@mui/icons-material/Delete";

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function startConversation(navigate, loggedInUserId, postUserId, postUserName) {
  // Navigate to chat/messages page with state
  navigate('/messages', {
    state: {
      otherUser: postUserId,
      otherUserName: postUserName,
      fromUser: loggedInUserId
    }
  });
}



const LinkedInPostsFeed = ({ posts }) => {
  let userId = null;
  try {
    const authUser = localStorage.getItem("firebase:authUser");
    if (authUser) {
      userId = JSON.parse(authUser).uid || null;
    }
  } catch {}

  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");

  // Filter posts based on location/profession
  const filteredPosts = posts.filter((post) => {
    const normalize = (str) => (str ? str.trim().toLowerCase() : "");
    let locationMatch = true;
    let professionMatch = true;
    if (normalize(selectedLocation) !== "") {
      locationMatch =
        post.location &&
        normalize(post.location) === normalize(selectedLocation);
    }
    if (normalize(selectedProfession) !== "") {
      professionMatch =
        post.profession &&
        normalize(post.profession) === normalize(selectedProfession);
    }
    return locationMatch && professionMatch;
  });

  return (
    <Box
      sx={{
        background: "#f8fafc",
        maxWidth: 900,
        width: "100%",
        mx: "auto",
        py: 4
      }}
    >
      {/* Filter Bar */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          width: "100%",
          justifyContent: "center"
        }}
      >
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Location</InputLabel>
          <Select
            value={selectedLocation}
            label="Location"
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <MenuItem value="">All Locations</MenuItem>
            {LOCATIONS.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Profession</InputLabel>
          <Select
            value={selectedProfession}
            label="Profession"
            onChange={(e) => setSelectedProfession(e.target.value)}
          >
            <MenuItem value="">All Professions</MenuItem>
            {PROFESSIONS.map((prof) => (
              <MenuItem key={prof} value={prof}>
                {prof}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Posts Feed */}
      <Grid container spacing={3} direction="column" alignItems="center">
        {filteredPosts.map((post) => (
          <Grid item key={post.id} sx={{ width: "100%", maxWidth: 600 }}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: 3,
                mb: 3,
                cursor: "pointer",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 8 }
              }}
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              <CardHeader
                avatar={
                  <Avatar
                    src={post.userProfilePic}
                    alt={post.userName}
                    sx={{ width: 48, height: 48, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${post.userId || post.userName}`);
                    }}
                  />
                }
                title={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%"
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="text.primary"
                      sx={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        flex: 1
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${post.userId || post.userName}`);
                      }}
                    >
                      {post.userName}
                    </Typography>

                    {/* Message Button always visible */}
                    <Tooltip title={`Message ${post.userName}`}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          startConversation(navigate, userId, post.userId, post.userName);
                        }}
                      >
                        <MessageIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {/* Edit & Delete Buttons for own posts */}
                    {post.canDelete && (
                      <>
                        {post.onEdit && (
                          <Tooltip title="Edit Post">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={e => {
                                e.stopPropagation();
                                post.onEdit(post.id);
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 18 }}>edit</span>
                            </IconButton>
                          </Tooltip>
                        )}
                        {post.onDelete && (
                          <Tooltip title="Delete Post">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={e => {
                                e.stopPropagation();
                                post.onDelete(post.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Box>
                }
                subheader={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {typeof post.profession === "string" &&
                      post.profession.trim() !== ""
                        ? post.profession
                        : post.profession || "N/A"}{" "}
                      |{" "}
                      {typeof post.location === "string" &&
                      post.location.trim() !== ""
                        ? post.location
                        : post.location || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {post.createdAt ? timeAgo(new Date(post.createdAt)) : ""}
                    </Typography>
                  </>
                }
              />
              <CardContent sx={{ pb: 2 }}>
                {post.caption && (
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ mb: 2 }}
                  >
                    {post.caption}
                  </Typography>
                )}
                {post.media && post.media.length > 0 && (
                  <MediaCarousel media={post.media} />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LinkedInPostsFeed;
