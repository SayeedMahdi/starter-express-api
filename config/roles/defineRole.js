import { defineAbility } from "@casl/ability";

const defineRole = (privilage, model) =>
  defineAbility((can) => can(privilage, model)).A;



export default defineRole;

