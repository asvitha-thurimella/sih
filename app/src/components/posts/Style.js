import { makeStyles } from "@material-ui/core/styles";

export default makeStyles(() => ({
  post: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
    marginTop: 10,
    padding: 10,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  },
  post__body: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  body__description: {
    fontSize: 14,
    margin: 0,
  },
  body__image: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    "& img": {
      width: "100%",
      borderRadius: 8,
    },
  },
}));
