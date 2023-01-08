import authController from "../controllers/auth.mjs"
const dataRoles = await import("./data/roles.json", {
  assert: { type: "json" },
});

export const fakeRole = () => {
  authController.insertManyRole(dataRoles)
} 