module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "b46375d2efd1c69d8efcdcb46d3acd67"),
  },
});
