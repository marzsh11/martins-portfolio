const projectModules = import.meta.glob('./entries/*.js', {
  eager: true,
  import: 'default',
})

export const projects = Object.values(projectModules).sort((a, b) =>
  a.id.localeCompare(b.id),
)

export const featuredProjects = projects.filter((project) => project.featured)
