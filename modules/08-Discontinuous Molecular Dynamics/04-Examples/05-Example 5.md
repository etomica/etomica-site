

= The p-c2D vs. Periodic Boundary 2D SW (pbc2d) =

We would like to understand better the distinctions between the system with walls and the system without.  Noting that realistic systems have 1023 molecules, we should investigate how the simulation results change with increasing number of molecules.  Unfortunately, the pbc applets have fixed box sizes, so we cannot vary the number of molecules while maintaining fixed density.  For the p-c2d applet, however, we can accomplish this.  The following exercises demonstrate this procedure and a homework problem carries it through in greater detail.  
1.Link to the p-c2d applet and set the potential to repulsion only.  Check that you are on the Configuration tab.  Set the number of molecules to 54 and the density to 2E-6.  How does the height of the piston changes in response to the density change?  Start the simulation and record the pressure, temperature, density and standard errors.  How does the simulation time for this simulation compare to that for Example 3c?
1.Link to the pbc2d applet and vary the number of molecules to achieve a density as close as possible to 2E-6.  Remember to reset averages and reinitialize during each iteration.  Set the potential to repulsion only.  Report the pressure, temperature, density and standard errors. Also report the number of molecules, the simulation time (ns) and an estimate of how long it takes for this simulation compared to Ex 3c and 5a.  
1.Compute the Z values where $Z = P/ \rho RT$.  This should be dimensionless.  Compare the Z values from Ex 3c, 5a, 5b.  What do you conclude about the three results as the number of molecules is changing?  

## Solutions 

1.The piston goes down as the density increases, squeezing the molecules into a smaller volume, as we should expect.  The pressure came out at 66.47±0.46 bar-nm in roughly 10 seconds of clock time and 4.0ns of simulation time.  T=300K and $\rho$=2.0mol/m² as stipulated.  This simulation time seemed less than half what it took for Ex 3c.  
1.30 molecules give 1.993E-6 for the density.  The pressure comes out to 69.01±0.13 in roughly 4 seconds of clock time and 2.3ns of simulation time.  
1.Referring to the dimensional analysis of Ex3c, Z = P/(1000ρRT) in these units.  So we get the results tabulated below.  By comparing Z instead of P, some of the small variation in $\rho$ is canceled since P increases as $\rho$ increases.

| Property | 3c | 5a | 5b |
| - | - | - | - |
| Type | p-c2d | p-c2d | pbc2d |
| N | 134 | 54 | 30 |
| ~Clock time(s) | 20 | 10 | 4 |
| $\rho$ | 2.005E-6 | 2.000E-6 | 1.993E-6 |
| P | 68.16 | 66.47 | 69.01 |
| Z | 1.363 | 1.332 | 1.388 |

Comparing the Z values, shows that the p-c2d Z value approaches the pbc2d value as the system becomes larger.  Noting the much shorter simulation time for pbc2d, it suggests that the pbc2d approach may provide greater accuracy in less time.  We should do some more experiments to confirm this.  What experiments and analysis would you suggest?
