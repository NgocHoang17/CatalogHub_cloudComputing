/**
 * Migration: Create Products Table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable('products');
  if (!exists) {
    await knex.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.string('sku', 50).notNullable().unique().index();
      table.string('name', 255).notNullable().index();
      table.text('description').nullable();
      table.string('category', 100).notNullable().defaultTo('General').index();
      table.decimal('price', 12, 2).notNullable().defaultTo(0.00);
      table.integer('stock').notNullable().defaultTo(0);
      table.string('image_url', 500).nullable();
      table.timestamps(true, true); // created_at and updated_at
    });
  }
}

/**
 * Rollback Migration
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('products');
}

