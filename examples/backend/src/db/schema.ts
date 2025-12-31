const dbType = process.env.DB_TYPE || 'sqlite';

// Dynamic export based on DB_TYPE
// Note: In a real Typescript project, you might need stronger typing or separate builds,
// but for this example, we rely on the runtime switch.

// We use require instead of import to allow conditional loading
// which prevents errors if dependencies for the unused DB are missing.

let schemaExport;

if (dbType === 'postgres') {
    schemaExport = require('./schema.postgres');
} else {
    schemaExport = require('./schema.sqlite');
}

export const groups = schemaExport.groups;
export const resources = schemaExport.resources;
export const events = schemaExport.events;
export const personnel = schemaExport.personnel;

