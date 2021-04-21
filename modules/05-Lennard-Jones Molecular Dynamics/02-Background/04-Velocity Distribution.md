

A system at fixed temperature is free to fluctuate in energy.  Boltzmann showed that the likelihood of observing the system in a particular microstate (*i.e.*, the detailed description of the molecules' positions and velocities) depends only on the energy $E_i$ of the the microstate, and in particular the probability $p_i$ is



$$
p_i = \exp{\left (-E_i / kT \right )} / Q
$$



where *k* is Boltzmann's constant and *Q* is a normalization constant that depends on *T*. States of large energy are less likely to be observed, but as the temperature is increased they grow increasingly relevant.

Note that this result does not by itself specify the distribution of energies.  The probability to observe the system in a given energy *E* depends also on how many microstates have that energy; let us designate this count as $\Omega(E)$.  Then the probability *p*(*E*) to observe a particular energy *E* is



$$
p(E) = \Omega (E) \exp \left (-E_i / kT \right ) / Q
$$



It is a postulate of thermodynamics that $\Omega(E)$ is a monotonically increasing function of *E*, while of course the Boltzmann distribution decreases with increasing *E*.  Thus the product of these two functions, *p*(*E*), exhibits a maximum, moving to larger values of *E* with increasing temperature.

There is a type of equilibrium between the kinetic and potential forms of the energy, in the same sense that the entire system is in equilibrium with an external bath that maintains the fixed temperature. Thus the Boltzmann distribution can be applied separately to the kinetic and potential energies. Because the kinetic energy depends only on the atomic velocities, the Boltzmann distribution can be applied to develop an expression for the distribution of velocities in the system.

According to the Boltzmann distribution applied to the kinetic energy only, the probability to observe the system in a particular state, in which the set of velocities are {$v_1, v_2,...,v_N$}, is



$$
p({v_1, v_2, ... v_N}) = \exp \left ( - \frac {1}{kT} \textstyle \sum_j \frac{1}{2}m_jv_j^2 \right ) / Q_K = \textstyle \prod_j \exp (-m_jv_j^2 / 2kT) \ Q_K
$$



where $Q_K$ is the normalization constant.  This result shows that the probability separates into a product over all atoms, and thus the total probability equals the product of independent probabilities for each atom.  We can then ask, what is the probability to observe a particular microstate in which the velocity of atom 1 (say) is $v_1$?  This is obtained by integrating over all other atom's velocities in the formula above, with the result



$$
p_i(v_1) = \exp (m_1v_1^2 / 2kT) / q_1
$$




Is this the probability to observe atom 1 to have velocity $v_1$?  No!  The atom has components of its velocity in the *x*, *y*, and *z* directions, and there are many ways to distribute velocity among these three components such that the total velocity is $v_1$. The probability to observe atom 1 to have a given velocity, regardless of how it is distributed among the component velocities, is the product of the result above with the number of ways to distribute the total velocity among the components. Because the total velocity is given as the sum of the squares of the component velocities,



$$
v_1^2 = v_{1,x}^2 + v_{1,y}^2 + v_{1,z}^2
$$



asking about number of ways that the total velocity has the value *v*<sub>1 </sub>is like asking what is the surface area of a sphere of radius $v_1$.  Thus for a 3-D system, the number of ways is proportional to the square of $v_1$



$$
\Omega (v_1) = 4\pi v_1^2
$$



and the probability to observe atom 1 to have velocity $v_1 $is



$$
p(v_1) = \left (\frac{2}{\pi}\right )^{\frac{1}{2}} \left (\frac{m_1}{T} \right)^{\frac{3}{2}} v_1^2 \exp(-m_1v_1^2 / 2kT)
$$



where we have written the normalization factors explicitly. For a 2-D system, the result is slightly different, because the total velocity is the sum of only two components. Then



$$
p^{(2D)}(v_1) = \left (\frac{m_1}{T} \right )v_1 \exp(-m_1v_1^2 / 2kT)
$$



It should also be noted that the probability to observe a given component of the velocity to have some value is given directly from the Boltzmann form, because there is only one way that a velocity component can have a particular value, thus



$$
p(v_{1,x}) = \left (\frac{2}{\pi} \frac{m_1}{T} \right )^{\frac{1}{2}} \exp(-m_1v_{1,x}^2) / 2kT)
$$



regardless of the system dimension.

The *Maxwell-Boltzmann* distribution is the name given to the distribution of velocities (speeds) as developed here.