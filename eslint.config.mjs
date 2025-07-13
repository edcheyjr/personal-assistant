import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import tailwindcss from 'eslint-plugin-tailwindcss'
import tanstackQuery from '@tanstack/eslint-plugin-query'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    ...tailwindcss.configs.recommended,
    ...tanstackQuery.configs['flat/recommended'],
]

export default eslintConfig
