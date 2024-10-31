import { NpmListProject, flattenNpmListOutput, npm } from './npm';
import { WxtPackageManagerImpl } from './types';
import spawn from 'nano-spawn';

export const pnpm: WxtPackageManagerImpl = {
  overridesKey: 'resolutions', // "pnpm.overrides" has a higher priority, but I don't want to deal with nesting
  downloadDependency(...args) {
    return npm.downloadDependency(...args);
  },
  async listDependencies(options) {
    const args = ['ls', '-r', '--json'];
    if (options?.all) {
      args.push('--depth', 'Infinity');
    }
    // Helper for testing - since WXT uses pnpm workspaces, folders inside it don't behave like
    // standalone projects unless you pass the --ignore-workspace flag.
    if (
      typeof process !== 'undefined' &&
      process.env.WXT_PNPM_IGNORE_WORKSPACE === 'true'
    ) {
      args.push('--ignore-workspace');
    }
    const res = await spawn('pnpm', args, { cwd: options?.cwd });
    const projects: NpmListProject[] = JSON.parse(res.stdout);

    return flattenNpmListOutput(projects);
  },
};
