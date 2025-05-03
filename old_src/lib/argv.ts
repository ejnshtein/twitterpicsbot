export default function argv (name: string): boolean {
  return process.argv.includes(name)
}
