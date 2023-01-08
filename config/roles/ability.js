import { defineAbility, ForbiddenError } from "@casl/ability";

const ability = (privilege, model) =>
  defineAbility((can) => {
    can(privilege, model);
  });

export default ability;
